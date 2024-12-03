const csv = require('csv-parser');
const xlsx = require('xlsx');
const stream = require('stream');
const moment = require('moment');
const orderModal = require('../Models/order');
const AppConstants = require('../constants');

const HEADER_MAPPING = {
    'Order ID': 'orderId',
    'Order Date': 'orderDate',
    'Customer ID': 'customerId',
    'Customer FirstName': 'customerFirstName',
    'Customer LastName': 'customerLastName',
    'Order Type': 'orderType',
    'Payment Type': 'paymentType',
    'Payment Status': 'paymentStatus',
    'Confirmation Status': 'confirmationStatus',
    'Promo Code': 'promoCode',
    'Promo Discount': 'promoDiscount',
    'Order Discount': 'orderDiscount',
    'Driver Tip': 'driverTip',
    'Delivery Charge': 'deliveryCharge',
    'Service Fee': 'serviceFee',
    'SurCharge': 'surcharge',
    'SubTotal': 'subTotal',
    'Taxes': 'taxes',
    'Total': 'total',
    'Branch Name': 'branchName',
    'Merchant ID': 'merchantId',
    'Status': 'status',
};

exports.UploadAndParseDocument = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const results = [];
        const errors = [];
        const uniqueOrderIds = new Set(); // To track unique Order IDs

        const mapRowToSchema = (row) => {
            const mappedRow = {};
            for (const [header, value] of Object.entries(row)) {
                if (HEADER_MAPPING[header]) {
                    mappedRow[HEADER_MAPPING[header]] = value || ''; // Default empty string for missing values
                }
            }
            if (!mappedRow.merchantId) {
                mappedRow.merchantId = ''
            }
            if (!mappedRow.status) {
                mappedRow.status = ''
            }
            return mappedRow;
        };

        for (const file of req.files) {
            const fileResults = [];
            const fileErrors = [];

            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);

                await new Promise((resolve, reject) => {
                    bufferStream
                        .pipe(csv({ headers: Object.keys(HEADER_MAPPING), skipLines: 1 }))
                        .on('data', (row) => {
                            const mappedRow = mapRowToSchema(row);

                            if (mappedRow.orderId && mappedRow.customerId && mappedRow.orderDate) {
                                mappedRow.orderDate = moment(mappedRow.orderDate, "YYYY-MM-DD HH:mm:ss.S").isValid()
                                    ? moment(mappedRow.orderDate, "YYYY-MM-DD HH:mm:ss.S").toDate()
                                    : null;

                                if (!mappedRow.orderDate) {
                                    fileErrors.push({fileName : file.originalname, Error : `File: ${file.originalname} - Invalid date format in row: ${JSON.stringify(row)}`});
                                } else if (!uniqueOrderIds.has(mappedRow.orderId)) {
                                    uniqueOrderIds.add(mappedRow.orderId);
                                    fileResults.push(mappedRow);
                                }
                            } else {
                                fileErrors.push({fileName : file.originalname, Error : `File: ${file.originalname} - Missing required data in row: ${JSON.stringify(row)}`});
                            }
                        })
                        .on('end', resolve)
                        .on('error', (err) => {
                            fileErrors.push({fileName : file.originalname, Error : err.message});
                            reject(err);
                        });
                });
            } else if (
                file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.originalname.endsWith('.xlsx')
            ) {
                const workbook = xlsx.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = rows[0];
                if (!headers.includes('Merchant ID')) {
                    headers.push('Merchant ID');
                }
                if (!headers.includes('Status')) {
                    headers.push('Status');
                }
                const missingHeaders = Object.keys(HEADER_MAPPING).filter((header) => !headers.includes(header));
                if (missingHeaders.length > 0) {
                    fileErrors.push({fileName : file.originalname, Error : `Missing Columns: ${missingHeaders.join(', ')}`});
                } else {
                    rows.slice(1).forEach((row) => {
                        const rowData = {};
                        headers.forEach((header, i) => {
                            rowData[HEADER_MAPPING[header]] = row[i] || '';
                        });
                        if (rowData.orderId && rowData.customerId && rowData.orderDate) {
                            rowData.orderDate = moment(rowData.orderDate, "YYYY-MM-DD HH:mm:ss.S").isValid()
                                ? moment(rowData.orderDate, "YYYY-MM-DD HH:mm:ss.S").toDate()
                                : null;

                            if (!rowData.orderDate) {
                                fileErrors.push({fileName : file.originalname, Error : `Invalid date format in row: ${JSON.stringify(rowData)}`});
                            } else if (!uniqueOrderIds.has(rowData.orderId)) {
                                uniqueOrderIds.add(rowData.orderId);
                                fileResults.push(rowData);
                            }
                        } else {
                            fileErrors.push({fileName : file.originalname, Error : `Missing required data in row: ${JSON.stringify(rowData)}`});
                        }
                    });
                }
            } else {
                fileResults.push({fileName: file.originalname, Error: 'Unsupported file type'});
            }

            if (fileResults.length > 0) results.push(...fileResults);
            if (fileErrors.length > 0) errors.push(...fileErrors);
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        if (results.length > 0) {
            await orderModal.insertMany(results);
        }

        return res.status(200).json({ results });
    } catch (error) {
        console.error('Error parsing files:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.GetAllOrders = async (req, res) => {
    try {
        const {
            merchantId,
            pageNo = 1,
            limit = 10,
            customerId,
            startDate,
            endDate,
            month,
            year,
            orderType,
            status,
            paymentStatus,
            branchName,
            sort
        } = req.query;

        // Ensure pageNo and limit are numbers
        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;

        // Calculate the starting index for pagination
        const skip = (page - 1) * limitValue;

        // Dynamically build the filter object
        const filter = {};

        if (merchantId) filter.merchantId = merchantId;
        if (customerId) filter.customerId = customerId;
        if (orderType) filter.orderType = orderType;
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (branchName) filter.branchName = branchName;

        // Filter by date range
        if (startDate && endDate) {
            filter.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        } else if (month && year) {
            const start = new Date(`${year}-${month}-01`);
            const end = new Date(`${year}-${month}-01`);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0); // Get the last day of the month
            end.setHours(23, 59, 59, 999); // End of the last day of the month
            filter.orderDate = {
                $gte: start,
                $lte: end,
            };
        } else if (year) {
            filter.orderDate = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            };
        }

        // Define the sort object based on the sort parameter
        const sortCriteria = {};
        if (sort === 'ascName') {
            sortCriteria.customerFirstName = 1; // Sort by customer name (A to Z)
        } else if (sort === 'descName') {
            sortCriteria.customerFirstName = -1; // Sort by customer name (Z to A)
        } else if (sort === 'ascOrder') {
            sortCriteria.orderDate = 1; // Sort by order date (oldest to newest)
        } else if (sort === 'descOrder') {
            sortCriteria.orderDate = -1; // Sort by order date (newest to oldest)
        }


        // Fetch the total number of orders for pagination metadata
        const totalOrders = await orderModal.countDocuments(filter);

        // Fetch orders with pagination and filtering
        const orders = await orderModal
            .find(filter)
            .sort(sortCriteria) 
            .skip(skip)              // Skip the appropriate number of records
            .limit(limitValue);      // Limit the number of records returned

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalOrders / limitValue);

        // Return the paginated orders along with metadata
        res.status(200).json({
            orders,
            currentPage: page,
            totalPages,
            totalOrders,
        });
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};


