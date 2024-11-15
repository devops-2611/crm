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

            // Calculate the total value for each order
            const totalForRow = order.subTotal
                - order.orderDiscount
                - order.promoDiscount;

            totalOrderValue += totalForRow;
        });

        let commissionRate = 0;
        if (key.toLowerCase() === 'delivery') {
            commissionRate = AppConstants.DELIVERY_COMMISSION;
        } else if (key.toLowerCase() === 'collection') {
            commissionRate = AppConstants.COLLECTION_COMMISSION;
        }

        const commissionAmount = (commissionRate * totalOrderValue) / 100;

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

    if(customer.serviceFee && type === 'orderType'){
        const orderValue = orders.reduce((acc, order) => acc + order.serviceFee, 0)
        calculations['SERVICE_FEE'] = {
            totalOrderValue: orderValue,
            totalOrders: orders.filter(order => order.serviceFee > 0).length,
            commissionRate: 0,
            amount: orderValue
        }
    }

    if(customer.deliveryCharge && type === 'orderType'){
        const orderValue = orders.reduce((acc, order) => acc + order.deliveryCharge, 0)
        calculations['DELIVERY_CHARGE'] = {
            totalOrderValue: orderValue,
            totalOrders: orders.filter(order => order.deliveryCharge > 0).length,
            commissionRate: 0,
            amount: orderValue
        }
    }

    if(customer.driverTip && type === 'orderType'){
        const orderValue = orders.reduce((acc, order) => acc + order.driverTip, 0)
        calculations['DRIVER_TIP'] = {
            totalOrderValue: orderValue,
            totalOrders: orders.filter(order => order.driverTip > 0).length,
            commissionRate: 0,
            amount: orderValue
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
