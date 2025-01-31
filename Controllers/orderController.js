const csv = require('csv-parser');
const xlsx = require('xlsx');
const stream = require('stream');
const moment = require('moment');
const orderModal = require('../Models/order');

const HEADER_MAPPING = {
    'Order ID': 'orderId',
    'Merchant ID': 'merchantId',
    'Order Date': 'orderDate',
    'Customer ID': 'customerId',
    'Customer FirstName': 'customerFirstName',
    'Customer LastName': 'customerLastName',
    'Order Type': 'orderType',
    'Payment Type': 'paymentType',
    'Payment Status': 'paymentStatus',
    'Confirmation Status': 'confirmationStatus',
    'Promo Code': 'promoCode',
    'Promo Discount (SWISHR)': 'promoDiscountSwishr',
    'Promo Discount (Merchant)': 'promoDiscountMerchant',
    'Refund (SWISHR)': 'refundSwishr',
    'Refund (Merchant)': 'refundMerchant',
    'Order Discount': 'orderDiscount',
    'Driver Tip': 'driverTip',
    'Delivery Charge': 'deliveryCharge',
    'Service Fee': 'serviceFee',
    'SurCharge': 'surcharge',
    'SubTotal': 'subTotal',
    'Taxes': 'taxes',
    'Total': 'total',
    'Branch Name': 'branchName',
    'Status': 'status',
    'Order Items': 'orderItems'
};

exports.UploadAndParseDocument = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No file uploaded', success: false, errors: [] });
        }

        const results = [];
        const errors = [];
        const uniqueOrderIds = new Set();

        const mapRowToSchema = (headers, row) => {
            const mappedRow = {};
            Object.keys(HEADER_MAPPING).forEach((header) => {
                const fileColumnIndex = headers.indexOf(header);
                
                if (fileColumnIndex !== -1) {
                    // If the header exists in the file, map its value
                    mappedRow[HEADER_MAPPING[header]] = row[fileColumnIndex] || '';
                } else {
                    // If the header doesn't exist, assign a default value
                    mappedRow[HEADER_MAPPING[header]] = HEADER_MAPPING[header].includes('refund') || HEADER_MAPPING[header].includes('Discount') ? 0 : '';
                }

                if(HEADER_MAPPING[header] === 'status' && !mappedRow.status) {
                    const status = mappedRow.confirmationStatus?.toLowerCase();
                    const orderType = mappedRow.orderType?.toLowerCase();
                    if (status === 'completed') {
                        mappedRow.status = orderType === 'delivery' ? 'DELIVERED' : orderType === 'collection' ? 'PICKED_UP' : '';
                    }
                }
            });
            return mappedRow;
        };
        // const mapRowToSchema = (headers, row) => {
        //     const mappedRow = {};
            
        //     // Normalize headers to lowercase for case-insensitive matching
        //     const normalizedHeaders = headers.map(header => header.toLowerCase());
            
        //     Object.keys(HEADER_MAPPING).forEach((header) => {
        //         const normalizedHeader = header.toLowerCase(); // Normalize the key from HEADER_MAPPING
        //         const fileColumnIndex = normalizedHeaders.indexOf(normalizedHeader); // Match case-insensitively
                
        //         if (fileColumnIndex !== -1) {
        //             // If the header exists in the file, map its value
        //             mappedRow[HEADER_MAPPING[header]] = row[fileColumnIndex] || '';
        //         } else {
        //             // If the header doesn't exist, assign a default value
        //             mappedRow[HEADER_MAPPING[header]] = HEADER_MAPPING[header].includes('refund') || HEADER_MAPPING[header].includes('Discount') ? 0 : '';
        //         }
        
        //         if (HEADER_MAPPING[header] === 'status' && !mappedRow.status) {
        //             const status = mappedRow.confirmationStatus?.toLowerCase();
        //             const orderType = mappedRow.orderType?.toLowerCase();
        //             if (status === 'completed') {
        //                 mappedRow.status = orderType === 'delivery' ? 'DELIVERED' : orderType === 'collection' ? 'PICKED_UP' : '';
        //             }
        //         }
        //     });
        //     return mappedRow;
        // };
        

        for (const file of req.files) {
            const fileResults = [];
            const fileErrors = [];

            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);

                await new Promise((resolve, reject) => {
                    const rows = [];
                    bufferStream
                        .pipe(csv())
                        .on('data', (row) => rows.push(row))
                        .on('end', () => {
                            const headers = Object.keys(rows[0]);
                            
                            rows.forEach((row) => {
                                const rowData = Object.values(row)
                                const filteredRow = []
                                const updatedHeading = []
                                headers.forEach((head,index) => {
                                    if(head && Object.keys(HEADER_MAPPING).includes(head)){
                                        updatedHeading.push(head);
                                        filteredRow.push(rowData[index])
                                    }
                                })
                                const mappedRow = mapRowToSchema(updatedHeading, filteredRow);

                                if (mappedRow.orderId && mappedRow.orderDate) {
                                    mappedRow.orderDate = moment(mappedRow.orderDate, "YYYY-MM-DD HH:mm:ss.S").isValid()
                                        ? moment(mappedRow.orderDate, "YYYY-MM-DD HH:mm:ss.S").toDate()
                                        : null;

                                    if (!mappedRow.orderDate) {
                                        fileErrors.push({ fileName: file.originalname, Error: `Invalid date format in row: ${JSON.stringify(row)}` });
                                    } else if (!uniqueOrderIds.has(mappedRow.orderId)) {
                                        uniqueOrderIds.add(mappedRow.orderId);
                                        fileResults.push(mappedRow);
                                    }
                                } else {
                                    fileErrors.push({ fileName: file.originalname, Error: `Missing required data in row: ${JSON.stringify(row)}` });
                                }
                            });
                            resolve();
                        })
                        .on('error', (err) => {
                            fileErrors.push({ fileName: file.originalname, Error: err.message });
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
                rows.slice(1).forEach((row) => {
                    const mappedRow = mapRowToSchema(headers, row);
                    if (mappedRow.orderId && mappedRow.customerId && mappedRow.orderDate) {
                        mappedRow.orderDate = moment(mappedRow.orderDate, "YYYY-MM-DD HH:mm:ss.S").isValid()
                            ? moment(mappedRow.orderDate, "YYYY-MM-DD HH:mm:ss.S").toDate()
                            : null;

                        if (!mappedRow.orderDate) {
                            fileErrors.push({ fileName: file.originalname, Error: `Invalid date format in row: ${JSON.stringify(mappedRow)}` });
                        } else if (!uniqueOrderIds.has(mappedRow.orderId)) {
                            uniqueOrderIds.add(mappedRow.orderId);
                            fileResults.push(mappedRow);
                        }
                    } else {
                        fileErrors.push({ fileName: file.originalname, Error: `Missing required data in row: ${JSON.stringify(mappedRow)}` });
                    }
                });
            } else {
                fileResults.push({ fileName: file.originalname, Error: 'Unsupported file type' });
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
            return res.status(400).json({ error: 'Error parsing files', errors, success: false });
        }

        if (results.length > 0) {
            await orderModal.insertMany(results);
        }

        return res.status(200).json({ results });
    } catch (error) {
        console.error('Error parsing files:', error);
        return res.status(500).json({ error: 'Internal Server Error', success: false, errors: [{ Error: error.message, fileName: req.files?.map(file => file.originalname).join(', ') }] });
    }
};

exports.GetAllOrders = async (req, res) => {
    try {
        const {
            orderId,
            merchantId,
            pageNo = 1,
            limit = 10,
            customerId,
            startDate,
            endDate,
            // month,
            // year,
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
        if (orderId) matchStage.orderId = { $in: orderId.split(',').map(id => id.trim()) };
        if (merchantId) matchStage.merchantId = { $in: merchantId.split(',') };
        if (customerId) matchStage.customerId = { $in: customerId.split(',') };
        if (orderType) matchStage.orderType = { $in: orderType.split(',') };
        if (status) matchStage.status = { $in: status.split(',') };
        if (paymentStatus) matchStage.paymentStatus = { $in: paymentStatus.split(',') };
        if (branchName) matchStage.branchName = { $in: branchName.split(',') };
        if (paymentType) matchStage.paymentType = { $in: paymentType.split(',') };
        if (confirmationStatus) matchStage.confirmationStatus = { $in: confirmationStatus.split(',') };

        // Date filtering
        if (startDate) {
            const start = new Date(startDate);
            let end;
            if (!endDate) {
                end = new Date();
                end.setHours(23, 59, 59, 999);
            } else {
                end = new Date(endDate);
            }

            matchStage.orderDate = { $gte: start, $lte: end };
        }
        // else if (month && year) {
        //     const start = new Date(`${year}-${month}-01`);
        //     const end = new Date(start);
        //     end.setMonth(start.getMonth() + 1);
        //     end.setDate(0);
        //     end.setHours(23, 59, 59, 999);
        //     matchStage.orderDate = { $gte: start, $lte: end };
        // } 
        // else if (year) {
        //     matchStage.orderDate = {
        //         $gte: new Date(`${year}-01-01`),
        //         $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        //     };
        // }


        // Sorting criteria

        const sortStage = {};
        sortStage.orderDate = -1; // by default
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
        const [orders, totalCount] = await Promise.all([
            orderModal.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
            orderModal.countDocuments(matchStage),
        ]);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({
            orders,
            currentPage: page,
            totalPages,
            totalCount,
        });
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ error: 'Server error', errors: [err.message], success: false });
    }
};


exports.DeleteOrder = async (req, res) => {
    const { id } = req.query;
    try {

        const ids = id.includes(',') ? id.split(',').map(Number) : [parseInt(id, 10)];

        const result = await orderModal.deleteMany({ orderId: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'No orders found for the given ID(s)',
                success: false,
                errors: []
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
            return res.status(400).json({ error: 'No updates provided', success: false, errors: [] });
        }

        let merchantUpdated = false;
        let customerUpdated = false;
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
                promoDiscountSwishr,
                promoDiscountMerchant,
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
                confirmationStatus,
                refundSwishr,
                refundMerchant, 
                customerId,
                orderItems
            } = update;

            // Find the order by orderId
            const order = await orderModal.findOne({ orderId: parseInt(orderId, 10) });
            if (!order) {
                return { success: false, error: 'Order not found', errors: [`Order with ID ${orderId} not found`] };
            }

            // Update the order fields
            if('status' in update) order.status = status;
            if('paymentStatus' in update) order.paymentStatus = paymentStatus;
            if('branchName' in update) order.branchName = branchName;
            if('customerFirstName' in update) order.customerFirstName = customerFirstName;
            if('customerLastName' in update) order.customerLastName = customerLastName;
            if('orderType' in update) order.orderType = orderType;
            if('paymentType' in update) order.paymentType = paymentType;
            if ('promoCode' in update) order.promoCode = promoCode;
            if ('promoDiscountSwishr' in update) order.promoDiscountSwishr = promoDiscountSwishr;
            if ('promoDiscountMerchant' in update) order.promoDiscountMerchant = promoDiscountMerchant;
            if ('orderDiscount' in update) order.orderDiscount = orderDiscount;
            if ('driverTip' in update) order.driverTip = driverTip;
            if ('deliveryCharge' in update) order.deliveryCharge = deliveryCharge;
            if ('serviceFee' in update) order.serviceFee = serviceFee;
            if ('surcharge' in update) order.surcharge = surcharge;
            if ('subTotal' in update) order.subTotal = subTotal;
            if ('taxes' in update) order.taxes = taxes;
            if ('total' in update) order.total = total;
            if ('orderDate' in update) order.orderDate = orderDate;
            if ('merchantId' in update) {
                merchantUpdated = order.merchantId != merchantId;
                order.merchantId = merchantId;
            }
            if ('confirmationStatus' in update) order.confirmationStatus = confirmationStatus;
            if ('refundSwishr' in update) order.refundSwishr = refundSwishr;
            if ('refundMerchant' in update) order.refundMerchant = refundMerchant;
            if ('customerId' in update) {
                customerUpdated = order.customerId != customerId;
                order.customerId = customerId
            }
            if ('orderItems' in update) order.orderItems = orderItems

            await order.save();

            return { orderId, success: true, message: 'Order updated successfully' };
        });

        // Wait for all updates to complete
        const results = await Promise.all(updatePromises);

        res.status(200).json({ results, success: true, merchantUpdated, customerUpdated });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error', errors: [err.message], success: false });
    }
};

exports.AddOrders = async (req, res) => {
    const order = req.body; // Array of orders

    try {
        // Validate input type and content
        //   if (!Array.isArray(orders) || orders.length === 0) {
        //     return res.status(400).json({ message: "Invalid input: Must send an array of orders.", success: false });
        //   }

        // Ensure all required fields are present in each order
        const requiredFields = Object.values(HEADER_MAPPING);
        const missingFields = [];

        if(!order.orderItems){
            order.orderItems = '';
        }

        //orders.forEach((order, index) => {
        requiredFields.forEach((field) => {
            if (!Object.hasOwn(order, field)) {
                missingFields.push(field);
            }
        });
        // });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: "Missing required fields.",
                success: false,
                errors: [missingFields?.join(", ")],
            });
        }

        // Insert valid orders into the database
        // const insertedOrders = await orderModal.insertOne(order);
        const addedOrder = new orderModal(order);
        await addedOrder.save();
        // Return success response
        res.status(201).json({
            message: `order added successfully.`,
            success: true,
            data: addedOrder,
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