
const InvoiceModal = require('../Models/invoice');
const OrderModal = require('../Models/order');
const MerchantModal = require('../Models/merchant');
const moment = require('moment-timezone');
const { calculateInvoiceParameters, generateInvoiceId, createPDF, getFinalDataForEditInvoice } = require('../Utils/invoiceUtils');
const { deleteBlob } = require('../azureBlobHelper');
const timeZone = 'Europe/London';
const MerchantItemsModal = require('../Models/merchantItems')

exports.getInvoicesByMerchantId = async (req, res) => {
    try {
        const { startDate, endDate, pageNo = 1, limit = 10, sort } = req.query
        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;
        const merchantId = parseInt(req.query.merchantId, 10);

        if (!merchantId) {
            return res.status(400).json({ message: 'Merchant ID is required' });
        }

        const invoices = await InvoiceModal.find({ merchantId });

        if (invoices.length === 0) {
            return res.status(201).json({ message: 'No invoices found' });
        }

        const matchStage = { merchantId: merchantId };

        if (startDate) {
            const start = new Date(startDate);
            let end;
            if (!endDate) {
                end = new Date();
                end.setHours(23, 59, 59, 999);
            } else {
                end = new Date(endDate);
            }

            matchStage.createdAt = { $gte: start, $lte: end };
        }

        const sortStage = {};
        sortStage.createdAt = -1;
        if (sort === 'asc') {
            sortStage.createdAt = 1;
        } else if (sort === 'desc') {
            sortStage.createdAt = -1;
        }

        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
        ];

        const result = await InvoiceModal.aggregate(pipeline);

        const totalCount = await InvoiceModal.countDocuments(matchStage);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({ invoices: result, totalCount, totalPages, currentPage: page, });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.generateInvoiceByMerchantIds = async (req, res) => {
    try {
        const { merchantIds, lastWeek, startDate, endDate } = req.body;

        if (!merchantIds) {
            return res.status(400).json({ message: 'Merchant IDs are required' });
        }

        const merchantIdArray = merchantIds.split(',').map(id => parseInt(id.trim(), 10));

        if (merchantIdArray.some(isNaN)) {
            return res.status(400).json({ message: 'Invalid Merchant IDs provided' });
        }

        let fromDate, toDate;

        if (lastWeek) {
            fromDate = moment.tz(timeZone).startOf('isoWeek').subtract(7, 'days').toDate();
            toDate = moment.tz(timeZone).endOf('isoWeek').subtract(7, 'days').toDate();
        }
        else if (startDate && endDate) {
            fromDate = new Date(startDate);
            toDate = new Date(endDate);
        } else {
            return res.status(400).json({ message: 'Provide date range to generate invoice', status: 'failed' });
        }

        const invoices = [];

        for (const merchantId of merchantIdArray) {

            const orders = await OrderModal.find({
                merchantId,
                orderDate: { $gte: fromDate, $lte: toDate }, // Filter by orderDate
                status: { $nin: ['ABANDONED', 'CANCELLED', 'REJECTED', 'FAILED'] }
            });

            if (!orders || orders.length === 0) {
                invoices.push({ merchantId, message: 'No orders found for the given date range', status: 'failed' });
                continue;
            }

            const existingInvoice = await InvoiceModal.findOne({
                merchantId,
                fromDate,
                toDate,
            });

            if (existingInvoice) {
                invoices.push({ merchantId, message: 'Invoice already exists for the given date range', status: 'failed' });
                continue;
            }

            const merchant = await MerchantModal.findOne({ merchantId });

            if (!merchant) {
                invoices.push({ merchantId, message: 'Merchant not found', status: 'failed' });
                continue;
            }

            const finalData = calculateInvoiceParameters(merchant, orders);

            const invoiceId = await generateInvoiceId(merchantId);

            const lastInvoice = await InvoiceModal.findOne({ merchantId }).sort({ createdAt: -1 });
            const lastInvoiceId = lastInvoice ? lastInvoice.invoiceId : null;
            let lastInvoiceCount =  0;
            if (lastInvoiceId) {
                const lastInvoiceIdWithLeadingZeros = lastInvoiceId.split('-').pop();
                lastInvoiceCount = parseInt(lastInvoiceIdWithLeadingZeros, 10) || 0;
            }
            const invoiceCount = lastInvoiceCount + 1;
            const formattedCount = String(invoiceCount).padStart(4, '0');

            const fileName = `invoice_${merchantId}_${formattedCount}.pdf`;

            const { pdfUrl, invoiceParameters } = await createPDF(fileName, merchant, fromDate, toDate, finalData, invoiceId);

            // Save Invoice Record
            const invoice = new InvoiceModal({
                merchantId,
                fromDate,
                toDate,
                downloadLink: pdfUrl,
                createdAt: moment.tz(timeZone).toDate(),
                invoiceParameters,
                status: 'UNPAID',
                invoiceId
            });

            await invoice.save();

            invoices.push({ merchantId, message: 'Invoice generated successfully', status: 'success', invoice });

        }

        res.status(201).json({ message: 'Invoice request processed', invoices });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllInvoices = async (req, res) => {
    try {
        const { merchantIds, startDate, endDate, status, pageNo = 1, limit = 10, sort } = req.query

        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;

        const matchStage = {};

        // Add filters dynamically
        if (merchantIds) {
            const merchantIdArray = merchantIds.split(',').map(id => parseInt(id.trim(), 10));
            matchStage.merchantId = { $in: merchantIdArray };
        }

        if (startDate) {
            const start = new Date(startDate);
            let end;
            if (!endDate) {
                end = new Date();
                end.setHours(23, 59, 59, 999);
            } else {
                end = new Date(endDate);
            }

            matchStage.createdAt = { $gte: start, $lte: end };
        }

        if (status) {
            matchStage.status = status;
        }

        const sortStage = {};
        sortStage.createdAt = -1;
        if (sort === 'asc') {
            sortStage.createdAt = 1;
        } else if (sort === 'desc') {
            sortStage.createdAt = -1;
        }

        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
        ];

        const result = await InvoiceModal.aggregate(pipeline);

        const totalCount = await InvoiceModal.countDocuments(matchStage);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({ invoices: result, totalCount, totalPages, currentPage: page, });


    } catch (error) {

    }
}

exports.editInvoice = async (req, res) => {
    const { merchantId, fromDate, toDate, status, invoiceId } = req.body;
    const newInvoiceParameters = req.body?.invoiceParameters

    try {
        const invoice = await InvoiceModal.findOne({ invoiceId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (status && invoice.status !== status) {
            invoice.status = status;
            invoice.updatedAt = moment.tz(timeZone).toDate()
            await invoice.save();

            const items = await MerchantItemsModal.find({
                itemId: { $in: newInvoiceParameters.merchantItemIds }
            });
            const itemSavePromises = items.map((item) => {
                const transactionIndex = item.transactions.findIndex(
                    (transaction) => transaction.invoiceId === invoiceId
                );
                if (transactionIndex !== -1) {
                    item.transactions[transactionIndex].isPaid = status === 'PAID';
                    return item.save();
                }
            });

            await Promise.all(itemSavePromises);

            return res.status(200).json({ message: 'Invoice updated successfully' });
        }

        const fileName = newInvoiceParameters.fileName || '';
        const merchant = await MerchantModal.findOne({ merchantId });

        const finalData = getFinalDataForEditInvoice(newInvoiceParameters, merchant.taxRate);
        const { pdfUrl, invoiceParameters } = await createPDF(fileName, merchant, fromDate, toDate, finalData, invoiceId, isEditInvoice = true);

        invoice.fromDate = fromDate;
        invoice.toDate = toDate;
        invoice.updatedAt = moment.tz(timeZone).toDate();
        invoice.invoiceParameters = invoiceParameters;
        invoice.downloadLink = pdfUrl;
        invoice.createdAt = moment.tz(invoiceParameters.invoiceDate,timeZone).toDate();

        await invoice.save();
        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteInvoice = async (req, res) => {
    const { invoiceId } = req.query;
    try {
        const ids = invoiceId.split(',').map(id => id.trim());
        const invoices = await InvoiceModal.find({ invoiceId: { $in: ids } });

        if (!invoices.length) {
            return res.status(404).json({
                error: 'No invoice found for the given invoice Id(s)',
                success: false,
                errors: []
            });
        }

        const deletePromises = invoices.map(async (invoice) => {
            const pdfPath = invoice.downloadLink;
            if (pdfPath) {
                await deleteBlob(pdfPath);
            }

            const items = await MerchantItemsModal.find({
                itemId: { $in: invoice.invoiceParameters.merchantItemIds }
            });

            // Remove transactions related to the invoice
            const itemSavePromises = items.map((item) => {
                const transactionIndex = item.transactions.findIndex(
                    (transaction) => transaction.invoiceId === invoice.invoiceId
                );
                if (transactionIndex !== -1) {
                    item.transactions.splice(transactionIndex, 1);
                    return item.save();
                }
            });

            await Promise.all(itemSavePromises);
        });

        await Promise.all(deletePromises);

        const result = await InvoiceModal.deleteMany({ invoiceId: { $in: ids } });

        res.status(200).json({
            message: 'Invoice deleted successfully',
            deletedCount: result.deletedCount,
            success: true
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: 'Server error',
            success: false,
            details: error.message
        });
    }
};

