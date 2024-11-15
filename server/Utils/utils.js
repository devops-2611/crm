const AppConstants = require("../constants");

const calculateOrderValues = (orders, customer, type) => {
    // Group data based on the type parameter (either orderType or paymentType)
    const groupedData = orders.reduce((acc, order) => {
        const key = order[type]; // Use the type parameter (orderType or paymentType)
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(order);
        return acc;
    }, {});

    const calculations = {};


    // Loop through each group (orderType or paymentType)
    for (const key in groupedData) {
        let totalOrderValue = 0;

        groupedData[key].forEach((order) => {
            // Apply config values if applicable
            const serviceFee = customer.serviceFee
                ? order.serviceFee
                : 0;
            const driverTip = customer.driverTip
                ? order.driverTip
                : 0;
            const deliveryCharge = customer.deliveryCharge
                ? order.deliveryCharge
                : 0;

            // Calculate the total value for each order
            const totalForRow = order.subTotal
                + serviceFee
                + driverTip
                + deliveryCharge
                - order.orderDiscount
                - order.promoDiscount;

            totalOrderValue += totalForRow;
        });

        // Set commission rate based on the orderType
        let commissionRate = 0;
        if (key.toLowerCase() === 'delivery') {
            commissionRate = AppConstants.DELIVERY_COMMISSION;
        } else if (key.toLowerCase() === 'collection') {
            commissionRate = AppConstants.COLLECTION_COMMISSION;
        }

        // Calculate commission amount
        const commissionAmount = (commissionRate * totalOrderValue) / 100;

        // Add calculations to the result object
        if (type === 'orderType') {
            calculations[key] = {
                totalOrderValue,
                totalOrders: groupedData[key].length,
                commissionRate,
                amount: commissionAmount,
            };
        }
        else if(type === 'paymentType') {
            calculations[key] = {
                totalOrderValue,
                totalOrders: groupedData[key].length,
            };
        }
        
    }

    return calculations;
};

const generateInvoiceId = (customerId) => {
    // Ensure the customerId is a 4-digit string by padding with zeros if necessary
    const customerIdFormatted = customerId.toString().padStart(4, '0');
    
    // Get the current date in the format ddmmyy
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = currentDate.getFullYear().toString().slice(-2); // Get the last 2 digits of the year

    // Get the last 4-6 digits of the timestamp
    const timestamp = currentDate.getTime().toString().slice(-6); // Take the last 6 digits of the timestamp

    // Generate the invoice ID
    const invoiceId = `SWSH-${customerIdFormatted}-${day}${month}${year}-${timestamp}`;
    
    return invoiceId;
};


module.exports = {calculateOrderValues, generateInvoiceId};
