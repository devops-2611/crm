
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const stream = require('stream');
const moment = require("moment");
const CustomerModel = require('../Models/customer');
const InvoiceModal = require('../Models/invoice');
const { calculateOrderValues, generateInvoiceId, getWeekBoundaries } = require('../Utils/utils');


// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

const expectedHeaders = [
    "Order ID",
    "Order Date",
    "Customer ID",
    "Customer FirstName",
    "Customer LastName",
    "Order Type",
    "Payment Type",
    "Payment Status",
    'Confirmation Status',
    'Promo Code',
    'Promo Discount',
    'Order Discount',
    'Driver Tip',
    'Delivery Charge',
    'Service Fee',
    'SurCharge',
    'Sub Total',
    'Taxes',
    'Total',
];

const requiredFields = [
    'Order Date', 'Order Type', 'Payment Type', 'Payment Status', 'Confirmation Status',
    'Promo Discount', 'Order Discount', 'Driver Tip',
    'Delivery Charge', 'Service Fee', 'SurCharge',
    'Sub Total',
];

const processRow = (row, fileErrors, fileName) => {
    
    const isEmptyRow = Object.values(row).every((value) => !value);
    if (isEmptyRow) return null;

    for (const field of requiredFields) {
        if (!row[field] && row[field] !== 0) {
            fileErrors.add(
                JSON.stringify({
                    fileName,
                    invalidField: field,
                    invalidValue: row[field],
                })
            );
        }
    }

    // Validate date fields
    const orderDateStr = row["Order Date"];
    const isOrderDateValid = moment(orderDateStr, "YYYY-MM-DD HH:mm:ss.S", true).isValid();
    if (!isOrderDateValid) {
        fileErrors.add(
            JSON.stringify({
                fileName,
                invalidField: "Order Date",
                invalidValue: orderDateStr,
            })
        );
    }

    if (fileErrors.size > 0) return null;
    return {
        orderId: row['Order ID'],
        orderDate: row['Order Date'],
        customerId: row['Customer ID'] || '',
        customerFirstname: row['Customer FirstName'] || '',
        customerLastname: row['Customer LastName'] || '',
        orderType: row['Order Type'],
        paymentType: row['Payment Type'],
        paymentStatus: row['Payment Status'],
        confirmationStatus: row['Confirmation Status'],
        promoCode: row['Promo Code'] || '',
        promoDiscount: parseFloat(row['Promo Discount']) || 0,
        orderDiscount: parseFloat(row['Order Discount']) || 0,
        driverTip: parseFloat(row['Driver Tip']) || 0,
        deliveryCharge: parseFloat(row['Delivery Charge']) || 0,
        serviceFee: parseFloat(row['Service Fee']) || 0,
        surCharge: parseFloat(row['SurCharge']) || 0,
        subTotal: parseFloat(row['Sub Total']) || 0,
        taxes: parseFloat(row['Taxes']) || 0,
        total: parseFloat(row['Total']) || 0,
    };
};
// Controller function to handle CSV upload and parsing directly from buffer
const uploadAndParseCSV = async (req, res) => {
    try {
        let { customerId, taxRate } = req.body;

        customerId = Number(customerId);
        taxRate = Number(taxRate);

        if (req.files?.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const customer = await CustomerModel.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const results = [];
        const errors = [];

        for (const file of req.files) {
            const resultsForFile = [];
            const fileErrors = new Set();

            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);
                

                await new Promise((resolve, reject) => {
                    bufferStream
                        .pipe(csv({ headers: expectedHeaders, skipLines: 1 }))
                        .on('data', (row) => {

                            const formattedRow = processRow(row, fileErrors, file.originalname);
                            if (formattedRow) resultsForFile.push(formattedRow);

                        })
                        .on('end', resolve)
                        .on('error', reject);
                });
            }
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx')){
                const workbook = xlsx.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                const createRowObject = (row, headers) => {
                    const rowObject = {};
                    headers.forEach((header, index) => {    
                        rowObject[header] = row[index] !== undefined ? row[index] : '';
                    });
                    return rowObject;
                };
                rows.forEach((row, index) => {
                    if (index === 0) return; // Skip header row

                    const rowObject = createRowObject(row, expectedHeaders);
                    const formattedRow = processRow(rowObject, fileErrors, file.originalname);
                    if (formattedRow) resultsForFile.push(formattedRow);
                });
            }

            if (fileErrors.size > 0) {
                const uniqueErrors = [...fileErrors].map((error) => JSON.parse(error));
                errors.push({
                    fileName: file.originalname,
                    issues: uniqueErrors,
                });
            }

            results.push(...resultsForFile);

        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: "Invalid data found in uploaded files",
                details: errors,
            });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'No valid data found in uploaded files' });
        }


        const calculationsByOrderType = calculateOrderValues(results, customer, 'orderType');
        const calculationsByPaymentType = calculateOrderValues(results, customer, 'paymentType');

        let totalSubTotal = 0;
        let totalSalesValue = 0;
        let serviceFeeCharge = 0;
        let totalFoodValue = 0;

        for (const orderType in calculationsByOrderType) {
            totalSubTotal += calculationsByOrderType[orderType].amount;
            if (orderType.toLowerCase() === 'delivery' || orderType.toLowerCase() === 'collection') {
                totalFoodValue += calculationsByOrderType[orderType].totalOrderValue;
            }
        }
        if(calculationsByOrderType['SERVICE_FEE'] && calculationsByOrderType['SERVICE_FEE'].isCashOrders){
            serviceFeeCharge = calculationsByOrderType['SERVICE_FEE'].amount;           
        }

        totalSalesValue = totalFoodValue + serviceFeeCharge;

        const tax_amount = (taxRate * totalSubTotal) / 100;
        const totalWithTax = totalSubTotal + tax_amount;

        const { startOfWeek, endOfWeek } = getWeekBoundaries(results[0].orderDate, results[results.length - 1].orderDate);

        const totalCashPayment = calculationsByPaymentType['CASH']?.totalOrderValue || 0
        const amountReceive = {
            total :  totalSalesValue - totalWithTax,
            cashPayment : totalCashPayment,
            bankPayment: totalSalesValue - totalWithTax - totalCashPayment,
        }

        const finalData = {
            customerId: customerId,
            calculationsByOrderType,
            calculationsByPaymentType,
            totalSubTotal,
            tax_amount,
            totalWithTax,
            totalSalesValue,
            amountToRecieve: amountReceive,
            startDate: startOfWeek,
            endDate: endOfWeek,
            taxRate: taxRate,
            totalFoodValue
        };

        res.status(200).json(finalData);
    } catch (error) {
        console.error("Error parsing CSV:", error.message);
        return res.status(500).json({ error: error.message });
    }
};


const saveInvoiceData = async (req, res) => {
    try {

        const finalData = req.body

        if (!finalData) {
            return res.status(400).json({ error: 'No data provided' });
        }

        finalData.invoiceId = generateInvoiceId(finalData.customerId);

        const invoice = new InvoiceModal(finalData);
        await invoice.save();

        res.status(200).json({ message: 'Invoice data saved successfully', invoice });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }

}

const uploadManualData = async (req, res) => {
    try {
        let { customerId, taxRate, orderData } = req.body;

        customerId = Number(customerId);
        taxRate = Number(taxRate);

        if (!Array.isArray(orderData) || orderData.length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        // Fetch the customer from the database
        const customer = await CustomerModel.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const results = orderData.map((order) => {

            return {
                orderDate: order.orderDate,
                orderType: order.orderType,
                paymentType: order.paymentType,
                paymentStatus: order.paymentStatus,
                confirmationStatus: order.confirmationStatus,
                promoDiscount: parseFloat(order.promoDiscount) || 0,
                orderDiscount: parseFloat(order.orderDiscount) || 0,
                driverTip: parseFloat(order.driverTip) || 0,
                deliveryCharge: parseFloat(order.deliveryCharge) || 0,
                serviceFee: parseFloat(order.serviceFee) || 0,
                surCharge: parseFloat(order.surCharge) || 0,
                subTotal: (parseFloat(order.subTotal) || 0)
            };
        });

        if (results.length === 0) {
            return res.status(400).json({ error: 'No valid data found in files' });
        }

        const calculationsByOrderType = calculateOrderValues(results, customer, 'orderType');

        const calculationsByPaymentType = calculateOrderValues(results, customer, 'paymentType');

        let totalSubTotal = 0;
        let totalSalesValue = 0;
        let serviceFeeCharge = 0;
        let totalFoodValue = 0;

        for (const orderType in calculationsByOrderType) {
            totalSubTotal += calculationsByOrderType[orderType].amount;
            if (orderType.toLowerCase() === 'delivery' || orderType.toLowerCase() === 'collection') {
                totalFoodValue += calculationsByOrderType[orderType].totalOrderValue;
            }
        }
        if(calculationsByOrderType['SERVICE_FEE'] && calculationsByOrderType['SERVICE_FEE'].isCashOrders){
            serviceFeeCharge = calculationsByOrderType['SERVICE_FEE'].amount;           
        }

        totalSalesValue = totalFoodValue + serviceFeeCharge;

        const tax_amount = (taxRate * totalSubTotal) / 100;
        const totalWithTax = totalSubTotal + tax_amount;

        const { startOfWeek, endOfWeek } = getWeekBoundaries(results[0].orderDate, results[results.length - 1].orderDate);

        const totalCashPayment = calculationsByPaymentType['CASH']?.totalOrderValue || 0
        const amountReceive = {
            total :  totalSalesValue - totalWithTax,
            cashPayment : totalCashPayment,
            bankPayment: totalSalesValue - totalWithTax - totalCashPayment,
        }

        const finalData = {
            customerId: customerId,
            calculationsByOrderType,
            calculationsByPaymentType,
            totalSubTotal,
            tax_amount,
            totalWithTax,
            totalSalesValue,
            amountToRecieve: amountReceive,
            startDate: startOfWeek,
            endDate: endOfWeek,
            taxRate: taxRate,
            totalFoodValue
        };

        res.status(200).json(finalData);

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: 'Server error' });
    }
}

const getInvoiceByCustomerId = async (req, res) => {
    const { id } = req.params; // Assuming 'id' is actually the 'customerId'
    try {
        const invoices = await InvoiceModal.find({ customerId: id });
        if (invoices.length === 0) {
            return res.status(404).json({ message: "No invoices found for this customer" });
        }
        res.status(200).json(invoices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { upload, uploadAndParseCSV, saveInvoiceData, getInvoiceByCustomerId, uploadManualData };
