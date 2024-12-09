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
            return res.status(400).json({ error: 'No file uploaded', success: false, errors:[] });
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

        // Validate for duplicates in the database
        const allOrderIds = results.map(order => order.orderId);
        const existingOrders = await orderModal.find({ orderId: { $in: allOrderIds } }, { orderId: 1 });
        const duplicateOrderIds = new Set(existingOrders.map(order => order.orderId));

        if (duplicateOrderIds.size > 0) {
            return res.status(400).json({
                error: 'Duplicate Order IDs found in the file.',
                success: false,
                errors: [
                    { Error: Array.from(duplicateOrderIds).join(', '), fileName: req.files?.map(file => file.originalname).join(', ') }
                ]
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({error: 'Error parsing files', errors, success: false });
        }

        if (results.length > 0) {
            await orderModal.insertMany(results);
        }

        return res.status(200).json({ results });
    } catch (error) {
        console.error('Error parsing files:', error);
        return res.status(500).json({ error: 'Internal Server Error', success: false, errors:[{Error: error.message, fileName: req.files?.map(file => file.originalname).join(', ') }] });
    }
};

// exports.GetAllOrders = async (req, res) => {
//     try {
//         const {
//             merchantId,
//             pageNo = 1,
//             limit = 10,
//             customerId,
//             startDate,
//             endDate,
//             month,
//             year,
//             orderType,
//             status,
//             paymentStatus,
//             branchName,
//             paymentType,
//             confirmationStatus,
//             sort
//         } = req.query;

//         // Ensure pageNo and limit are numbers
//         const page = parseInt(pageNo, 10) || 1;
//         const limitValue = parseInt(limit, 10) || 10;

//         // Calculate the starting index for pagination
//         const skip = (page - 1) * limitValue;

//         // Dynamically build the filter object
//         const filter = {};

//         if (merchantId) filter.merchantId = { $in: merchantId.split(',') };
//         if (customerId) filter.customerId = { $in: customerId.split(',') };
//         if (orderType) filter.orderType = { $in: orderType.split(',') };
//         if (status) filter.status = { $in: status.split(',') };
//         if (paymentStatus) filter.paymentStatus = { $in: paymentStatus.split(',') };
//         if (branchName) filter.branchName = { $in: branchName.split(',') };
//         if (paymentType) filter.paymentType = { $in: paymentType.split(',') };
//         if (confirmationStatus) filter.confirmationStatus = { $in: confirmationStatus.split(',') };

//         // Filter by date range
//         if (startDate && endDate) {
//             filter.orderDate = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//             };
//         } else if (month && year) {
//             const start = new Date(`${year}-${month}-01`);
//             const end = new Date(`${year}-${month}-01`);
//             end.setMonth(end.getMonth() + 1);
//             end.setDate(0); // Get the last day of the month
//             end.setHours(23, 59, 59, 999); // End of the last day of the month
//             filter.orderDate = {
//                 $gte: start,
//                 $lte: end,
//             };
//         } else if (year) {
//             filter.orderDate = {
//                 $gte: new Date(`${year}-01-01`),
//                 $lte: new Date(`${year}-12-31T23:59:59.999Z`),
//             };
//         }

//         // Define the sort object based on the sort parameter
//         const sortCriteria = {};
//         if (sort === 'ascFirstName') {
//             sortCriteria.customerFirstName = 1; // Sort by customer name (A to Z)
//         } else if (sort === 'descFirstName') {
//             sortCriteria.customerFirstName = -1; // Sort by customer name (Z to A)
//         } else if (sort === 'ascOrder') {
//             sortCriteria.orderDate = 1; // Sort by order date (oldest to newest)
//         } else if (sort === 'descOrder') {
//             sortCriteria.orderDate = -1; // Sort by order date (newest to oldest)
//         }
//         else if (sort === 'descLastName') {
//             sortCriteria.customerLastName = -1;
//         }
//         else if (sort === 'ascLastName') {
//             sortCriteria.customerLastName = 1;
//         }

//         // Add case-insensitive collation
//         const collation = { locale: 'en', strength: 2 };

//         // Fetch the total number of orders for pagination metadata
//         const totalOrders = await orderModal.countDocuments(filter);

//         // Fetch orders with pagination and filtering
//         const orders = await orderModal
//             .find(filter)
//             .sort(sortCriteria) 
//             .collation(collation)
//             .skip(skip)              // Skip the appropriate number of records
//             .limit(limitValue);      // Limit the number of records returned

//         // Calculate the total number of pages
//         const totalPages = Math.ceil(totalOrders / limitValue);

//         // Return the paginated orders along with metadata
//         res.status(200).json({
//             orders,
//             currentPage: page,
//             totalPages,
//             totalOrders,
//         });
//     } catch (err) {
//         console.error('Error fetching orders:', err.message);
//         res.status(500).json({ error: 'Server error', details: err.message });
//     }
// };


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
            paymentType,
            confirmationStatus,
            sort
        } = req.query;

        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;

        const matchStage = {};

        // Add filters dynamically
        if (merchantId) matchStage.merchantId = { $in: merchantId.split(',') };
        if (customerId) matchStage.customerId = { $in: customerId.split(',') };
        if (orderType) matchStage.orderType = { $in: orderType.split(',') };
        if (status) matchStage.status = { $in: status.split(',') };
        if (paymentStatus) matchStage.paymentStatus = { $in: paymentStatus.split(',') };
        if (branchName) matchStage.branchName = { $in: branchName.split(',') };
        if (paymentType) matchStage.paymentType = { $in: paymentType.split(',') };
        if (confirmationStatus) matchStage.confirmationStatus = { $in: confirmationStatus.split(',') };

        // Date filtering
        if (startDate && endDate) {
            matchStage.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
            };
        } else if (month && year) {
            const start = new Date(`${year}-${month}-01`);
            const end = new Date(start);
            end.setMonth(start.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
            matchStage.orderDate = { $gte: start, $lte: end };
        } else if (year) {
            matchStage.orderDate = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            };
        }

        // Sorting criteria
        const sortStage = {};
        if (sort === 'ascFirstName') sortStage.customerFirstName = 1;
        if (sort === 'descFirstName') sortStage.customerFirstName = -1;
        if (sort === 'ascOrder') sortStage.orderDate = 1;
        if (sort === 'descOrder') sortStage.orderDate = -1;
        if (sort === 'ascLastName') sortStage.customerLastName = 1;
        if (sort === 'descLastName') sortStage.customerLastName = -1;

        // Aggregate pipeline
        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
        ];

        // Fetch data and count total orders
        const [orders, totalOrders] = await Promise.all([
            orderModal.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
            orderModal.countDocuments(matchStage),
        ]);

        const totalPages = Math.ceil(totalOrders / limitValue);

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


exports.DeleteOrder = async (req, res) => {
  const { id } = req.query;
  try {

    const ids = id.includes(',') ? id.split(',').map(Number) : [parseInt(id, 10)];

    const result = await orderModal.deleteMany({ orderId: { $in: ids } });

    if (result.deletedCount === 0) {
        return res.status(404).json({ 
            message: 'No orders found for the given ID(s)', 
            success: false 
        });
    }

    res.status(200).json({
        message: `${result.deletedCount} order(s) deleted successfully`,
        success: true,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.UpdateOrder = async (req, res) => {
    const updates = req.body; // Array of updates

    try {
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: 'No updates provided', success: false });
        }

        // Iterate through the updates and process each one
        const updatePromises = updates.map(async (update) => {
            const {
                orderId,
                status,
                paymentStatus,
                branchName,
                customerFirstName,
                customerLastName,
                orderType,
                paymentType,
                promoCode,
                promoDiscount,
                orderDiscount,
                driverTip,
                deliveryCharge,
                serviceFee,
                surcharge,
                subTotal,
                taxes,
                total,
                orderDate,
                merchantId,
                confirmationStatus
            } = update;

            // Find the order by orderId
            const order = await orderModal.findOne({ orderId: parseInt(orderId, 10) });
            if (!order) {
                return { orderId, success: false, message: 'Order not found' };
            }

            // Update the order fields
            order.status = status || order.status;
            order.paymentStatus = paymentStatus || order.paymentStatus;
            order.branchName = branchName || order.branchName;
            order.customerFirstName = customerFirstName || order.customerFirstName;
            order.customerLastName = customerLastName || order.customerLastName;
            order.orderType = orderType || order.orderType;
            order.paymentType = paymentType || order.paymentType;
            order.promoCode = promoCode || order.promoCode;
            order.promoDiscount = promoDiscount || order.promoDiscount;
            order.orderDiscount = orderDiscount || order.orderDiscount;
            order.driverTip = driverTip || order.driverTip;
            order.deliveryCharge = deliveryCharge || order.deliveryCharge;
            order.serviceFee = serviceFee || order.serviceFee;
            order.surcharge = surcharge || order.surcharge;
            order.subTotal = subTotal || order.subTotal;
            order.taxes = taxes || order.taxes;
            order.total = total || order.total;
            order.orderDate = orderDate || order.orderDate;
            order.merchantId = merchantId || order.merchantId;
            order.confirmationStatus = confirmationStatus || order.confirmationStatus;

            await order.save();

            return { orderId, success: true, message: 'Order updated successfully' };
        });

        // Wait for all updates to complete
        const results = await Promise.all(updatePromises);

        res.status(200).json({ results, success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.AddOrders = async (req, res) => {
    const orders = req.body; // Array of orders
  
    try {
      // Validate input type and content
      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({ message: "Invalid input: Must send an array of orders.", success: false });
      }
  
      // Ensure all required fields are present in each order
      const requiredFields = Object.values(HEADER_MAPPING);
      const missingFields = [];
  
      orders.forEach((order, index) => {
        requiredFields.forEach((field) => {
          if (!Object.hasOwn(order, field)) {
            missingFields.push(field);
          }
        });
      });
  
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Missing required fields.",
          success: false,
          missingFields: missingFields?.join(", "),
        });
      }
  
      // Insert valid orders into the database
      const insertedOrders = await orderModal.insertMany(orders);
  
      // Return success response
      res.status(201).json({
        message: `${insertedOrders.length} order(s) added successfully.`,
        success: true,
        data: insertedOrders,
      });
    } catch (err) {
      console.error("Error adding orders:", err.message);
  
      // Check for duplicate order ID errors
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Duplicate order ID(s) found. Ensure all order IDs are unique.",
          success: false,
          error: err.message,
        });
      }
  
      res.status(500).json({ message: "Server error", success: false, error: err.message });
    }
  };