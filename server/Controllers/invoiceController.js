
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
const CustomerModel = require('../Models/customer');
const InvoiceModal = require('../Models/invoice'); 
const { calculateOrderValues, generateInvoiceId } = require('../Utils/utils');


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
    'Branch Name'
];

// Controller function to handle CSV upload and parsing directly from buffer
const uploadAndParseCSV = async (req, res) => {
    try {

        let { customerId, taxRate } = req.body;

customerId = Number(customerId);
 taxRate = Number(taxRate);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const customer = await CustomerModel.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const results = [];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream
            .pipe(csv({ headers: expectedHeaders, skipLines: 1 }))
            .on('data', (row) => {
                // Map and format each row
                const formattedRow = {
                    orderId: row['Order ID'],
                    orderDate: row['Order Date'],
                    customerId: row['Customer ID'],
                    customerFirstname: row['Customer FirstName'],
                    customerLastname: row['Customer LastName'],
                    orderType: row['Order Type'],
                    paymentType: row['Payment Type'],
                    paymentStatus: row['Payment Status'],
                    confirmationStatus: row['Confirmation Status'],
                    promoCode: row['Promo Code'],
                    promoDiscount: parseFloat(row['Promo Discount']) || 0,
                    orderDiscount: parseFloat(row['Order Discount']) || 0,
                    driverTip: parseFloat(row['Driver Tip']) || 0,
                    deliveryCharge: parseFloat(row['Delivery Charge']) || 0,
                    serviceFee: parseFloat(row['Service Fee']) || 0,
                    surCharge: parseFloat(row['SurCharge']) || 0,
                    subTotal: parseFloat(row['Sub Total']) || 0,
                    taxes: parseFloat(row['Taxes']) || 0,
                    total: parseFloat(row['Total']) || 0,
                    branchName: row['Branch Name']
                };
                results.push(formattedRow);
            })
            .on('end', async () => {

                const calculationsByOrderType = calculateOrderValues(results, customer?.configDetails, 'orderType');

                const calculationsByPaymentType = calculateOrderValues(results, customer?.configDetails, 'paymentType');

                let totalSubTotal = 0;
                let totalSalesValue = 0
                for (const orderType in calculationsByOrderType) {
                    totalSubTotal += calculationsByOrderType[orderType].amount;
                    totalSalesValue += calculationsByOrderType[orderType].totalOrderValue;
                }

                const tax_amount = (taxRate * totalSubTotal) / 100;
                const totalWithTax = totalSubTotal + tax_amount;

                const finalData = {
                    invoiceId: generateInvoiceId(customerId),
                    customerId: customerId,
                    calculationsByOrderType,
                    calculationsByPaymentType,
                    totalSubTotal,
                    tax_amount,
                    totalWithTax,
                    totalSalesValue,
                    amountToRecieve: totalSalesValue - totalWithTax,
                    startDate: results[0].orderDate,
                    endDate: results[results.length - 1].orderDate,
                    storeName: results[0].branchName
                }

                const invoice = new InvoiceModal(finalData);
                await invoice.save();

                res.status(200).json(finalData);

            })
            .on('error', (error) => {
                console.error("Error parsing CSV:", error);
                res.status(500).json({ error: 'Error parsing CSV file' });
            });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { upload, uploadAndParseCSV };
