
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');

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
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
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
            .on('end', () => {
                // Send parsed data as JSON response after processing all rows
                res.status(200).json({ data: results });
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
