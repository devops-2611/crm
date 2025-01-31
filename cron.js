const cron = require('node-cron');
const moment = require('moment-timezone');
const MerchantModal = require('./Models/merchant');
const OrderModal = require('./Models/order');
const InvoiceModal = require('./Models/invoice');

const merchant = require('./Models/merchant');
const { calculateInvoiceParameters, generateInvoiceId, createPDF } = require('./Utils/invoiceUtils');

const timeZone = 'Europe/London';


const generateInvoices = async () => {
    try {
        const fromDate = moment.tz(timeZone).startOf('isoWeek').subtract(7, 'days').toDate();
        const toDate = moment.tz(timeZone).endOf('isoWeek').subtract(7, 'days').toDate();

        // Fetch all merchants with orders from last week
        const orders = await OrderModal.aggregate([
            { $match: { orderDate: { $gte: fromDate, $lte: toDate }, status: { $nin: ['ABANDONED', 'CANCELLED', 'REJECTED'] } } },
            {
                $group: {
                    _id: '$merchantId',
                    orders: { $push: '$$ROOT' },
                },
            },
        ]);

        if(orders.length === 0){
            console.log('No orders found for last week.');
            return;
        }

        for (const merchantOrders of orders) {

            const { _id: merchantId, orders } = merchantOrders;

            // Check if invoice already exists for the merchant and the date range
            const existingInvoice = await InvoiceModal.findOne({
                merchantId: parseInt(merchantId, 10),
                fromDate: fromDate,
                toDate: toDate,
            });

            if (existingInvoice) {
                console.log(
                    `Invoice already exists for Merchant ID: ${merchantId}, From: ${moment(fromDate).tz(timeZone).format('DD MMM YYYY')}, To: ${moment(toDate).tz(timeZone).format('DDMMMYYYY')}`
                );
                continue; // Skip creating a new invoice if it already exists
            }

            const merchant = await MerchantModal.findOne({ merchantId: parseInt(merchantId, 10) });

            const finalData = calculateInvoiceParameters(merchant, orders);

            finalData.merchantId = merchantId;
            finalData.fromDate = fromDate;
            finalData.toDate = toDate;

            const invoiceId = await generateInvoiceId(merchantId);

            // Create Invoice PDF
            const lastInvoice = await InvoiceModal.findOne({ merchantId }).sort({ createdAt: -1 });
            const lastInvoiceId = lastInvoice ? lastInvoice.invoiceId : null;
            let lastInvoiceCount = 0;
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
            });

            await invoice.save();

            console.log(`Invoice for Merchant Id - ${merchantId} generated successfully for the week ${moment(fromDate).tz(timeZone).format('DD MMM YYYY')} - ${moment(toDate).tz(timeZone).format('DD MMM YYYY')}`);
        }

    } catch (err) {
        console.error('Error generating invoices:', err);
    }
};


cron.schedule('0 0 * * 3', generateInvoices);

module.exports = generateInvoices;