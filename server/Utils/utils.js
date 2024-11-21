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

        let totalCashOrdersWithServiceFee = 0;
        let cashOrderValueService = 0;

        if(!customer.serviceFee && type === 'paymentType' && orders.some(order => order.paymentType === 'CASH' && order.serviceFee > 0)){
             totalCashOrdersWithServiceFee = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0)?.length 
             cashOrderValueService = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0).reduce((acc, order) => acc + order.serviceFee, 0)
        }

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
                totalOrderValue : key === 'CARD' ? totalOrderValue : totalOrderValue + cashOrderValueService,
                totalOrders: groupedData[key].length,
            };
            if (key === 'CASH') {
                calculations['CASH'].isServiceFeeIncluded = true
            }
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

    //if service fee is not applicable, check if any cash payment is made for service fee, if so, calculate the total amount of cash payment for service fee column

    if(!customer.serviceFee && type === 'orderType' && orders.some(order => order.paymentType === 'CASH' && order.serviceFee > 0)){
        const totalCashOrdersWithServiceFee = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0)?.length 
        const cashOrderValueService = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0).reduce((acc, order) => acc + order.serviceFee, 0) 
        calculations['SERVICE_FEE'] = {
            totalOrderValue: cashOrderValueService,
            totalOrders: totalCashOrdersWithServiceFee,
            commissionRate: 0,
            amount: cashOrderValueService,
            isCashOrders : true
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

const getWeekBoundaries = (startDateStr, endDateStr) => {
    const parseDate = (dateStr) => new Date(dateStr.replace(" ", "T")); // Ensure ISO-8601 format
  
    // Parse input dates
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
  
    // Function to calculate the Monday before or on the given date
    const getMonday = (date) => {
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const diff = day === 0 ? -6 : 1 - day; // Adjust to the Monday of the current week
      const monday = new Date(date);
      monday.setDate(date.getDate() + diff);
      return monday;
    };
  
    // Function to calculate the Sunday after or on the given date
    const getSunday = (date) => {
      const day = date.getDay();
      const diff = day === 0 ? 0 : 7 - day; // Adjust to the Sunday of the current week
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + diff);
      return sunday;
    };
  
    // Get the desired Monday and Sunday
    const monday = getMonday(startDate);
    const sunday = getSunday(endDate);
  
    // Format dates as "YYYY-MM-DD HH:mm:ss.s"
    const formatDate = (date) => {
      const pad = (n) => (n < 10 ? `0${n}` : n);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${Math.floor(date.getMilliseconds() / 100)}`;
    };
  
    return {
      startOfWeek: formatDate(monday),
      endOfWeek: formatDate(sunday),
    };
  };

  const validateHeaders = (fileHeaders) => {
    const missingRequiredHeaders = requiredHeaders.filter(
        (header) => !fileHeaders.includes(header)
    );

    const unexpectedHeaders = fileHeaders.filter(
        (header) =>
            !requiredHeaders.includes(header) && !optionalHeaders.includes(header)
    );

    const isValid = missingRequiredHeaders.length === 0 && unexpectedHeaders.length === 0;

    return {
        isValid,
        missingRequiredHeaders,
        unexpectedHeaders,
    };
};
  

module.exports = {calculateOrderValues, generateInvoiceId, getWeekBoundaries, validateHeaders};
