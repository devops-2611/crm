const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const pdfMake = require('pdfmake/build/pdfmake');

const vfsFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.vfs;
const timeZone = 'Europe/London';

const InvoiceModal = require('../Models/invoice');
const MerchantItemsModal = require('../Models/merchantItems');
const { uploadPdfBuffer } = require('../azureBlobHelper');
const { getNextId } = require('./utils');

const generateInvoiceId = async (merchantId) => {
    const invoiceCount = await getNextId('invoice');
    const formattedCount = String(invoiceCount).padStart(4, '0');
    const formattedMerchantId = String(merchantId).padStart(4, '0');
    const invoiceId = `SWSH-230324-${formattedMerchantId}-${formattedCount}`;
    return invoiceId;
};

const calculateInvoiceParameters = (merchant, orders) => {
    const calculationsByOrderType = calculateOrderValues(orders, merchant, 'orderType');
    const calculationsByPaymentType = calculateOrderValues(orders, merchant, 'paymentType');

    let totalSubTotal = 0;
    let totalSalesValue = 0;
    let serviceFeeCharge = 0;
    let deliveryFeeCharge = 0;
    let totalFoodValue = 0;

    for (const orderType in calculationsByOrderType) {
        totalSubTotal += calculationsByOrderType[orderType].amount;
        if (orderType.toLowerCase() === 'delivery' || orderType.toLowerCase() === 'collection') {
            totalFoodValue += calculationsByOrderType[orderType].totalOrderValue;
        }
    }
    if (calculationsByOrderType['SERVICE_FEE'] && calculationsByOrderType['SERVICE_FEE'].isCashOrders) {
        serviceFeeCharge = calculationsByOrderType['SERVICE_FEE'].amount;
    }
    if (calculationsByOrderType['DELIVERY_CHARGE'] && calculationsByOrderType['DELIVERY_CHARGE'].isCashOrders) {
        deliveryFeeCharge = calculationsByOrderType['DELIVERY_CHARGE'].amount;
    }

    totalSalesValue = totalFoodValue + serviceFeeCharge + deliveryFeeCharge;

    const tax_amount = (merchant.taxRate * totalSubTotal) / 100;
    const totalWithTax = totalSubTotal + tax_amount;

    const totalCashPayment = calculationsByPaymentType['CASH']?.totalOrderValue || 0
    const amountReceive = {
        total: totalSalesValue - totalWithTax,
        cashPayment: totalCashPayment,
        bankPayment: totalSalesValue - totalWithTax - totalCashPayment,
    }

    const finalData = {
        calculationsByOrderType,
        calculationsByPaymentType,
        totalSubTotal: totalSubTotal?.toFixed(2),
        tax_amount: tax_amount.toFixed(2),
        totalWithTax: totalWithTax?.toFixed(2),
        totalSalesValue: totalSalesValue?.toFixed(2),
        amountToRecieve: amountReceive,
        taxRate: merchant.taxRate,
        totalFoodValue
    };

    return finalData
}

const calculateOrderValues = (orders, merchant, type) => {
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
                - order.promoDiscountSwishr
                - order.promoDiscountMerchant;
            totalOrderValue += totalForRow;
        });

        let commissionRate = 0;
        if (key.toLowerCase() === 'delivery') {
            commissionRate = merchant?.deliveryOrdersComission;
        } else if (key.toLowerCase() === 'collection') {
            commissionRate = merchant?.collectionOrdersComission;
        }


        const commissionAmount = (commissionRate * totalOrderValue) / 100;

        let totalCashOrdersWithServiceFee = 0;
        let cashOrderValueService = 0;

        if (!merchant.serviceFeeApplicable && type === 'paymentType' && orders.some(order => order.paymentType === 'CASH' && order.serviceFee > 0)) {
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
        else if (type === 'paymentType') {
            calculations[key] = {
                totalOrderValue: key === 'CARD' ? totalOrderValue : totalOrderValue + cashOrderValueService,
                totalOrders: groupedData[key].length,
            };
            if (key === 'CASH') {
                calculations['CASH'].isServiceFeeIncluded = true
            }
        }

    }

    if (merchant.serviceFeeApplicable && type === 'orderType') {
        const orderValue = orders.reduce((acc, order) => acc + order.serviceFee, 0)
        calculations['SERVICE_FEE'] = {
            totalOrderValue: orderValue,
            totalOrders: orders.filter(order => order.serviceFee > 0).length,
            commissionRate: 0,
            amount: orderValue
        }
    }

    //if service fee is not applicable, check if any cash payment is made for service fee, if so, calculate the total amount of cash payment for service fee column

    if (!merchant.serviceFeeApplicable && type === 'orderType' && orders.some(order => order.paymentType === 'CASH' && order.serviceFee > 0)) {
        const totalCashOrdersWithServiceFee = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0)?.length
        const cashOrderValueService = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0).reduce((acc, order) => acc + order.serviceFee, 0)
        calculations['SERVICE_FEE'] = {
            totalOrderValue: cashOrderValueService,
            totalOrders: totalCashOrdersWithServiceFee,
            commissionRate: 0,
            amount: cashOrderValueService,
            isCashOrders: true
        }
    }

    if (merchant.deliveryChargeApplicable && type === 'orderType') {
        const orderValue = orders.reduce((acc, order) => acc + order.deliveryCharge, 0)
        calculations['DELIVERY_CHARGE'] = {
            totalOrderValue: orderValue,
            totalOrders: orders.filter(order => order.deliveryCharge > 0).length,
            commissionRate: 0,
            amount: orderValue
        }
    }

    if (!merchant.deliveryChargeApplicable && type === 'orderType' && orders.some(order => order.paymentType === 'CASH' && order.deliveryCharge > 0)) {
        const totalCashOrdersWithDeliveryCharge = orders.filter(order => order.paymentType === 'CASH' && order.deliveryCharge > 0)?.length
        const cashOrderValueDelivery = orders.filter(order => order.paymentType === 'CASH' && order.deliveryCharge > 0).reduce((acc, order) => acc + order.deliveryCharge, 0)
        calculations['DELIVERY_CHARGE'] = {
            totalOrderValue: cashOrderValueDelivery,
            totalOrders: totalCashOrdersWithDeliveryCharge,
            commissionRate: 0,
            amount: cashOrderValueDelivery,
            isCashOrders: true
        }
    }

    if (merchant.driverTipApplicable && type === 'orderType') {
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

const getFinalDataForEditInvoice = (invoiceParameters, taxRate) => {

    let totalSubTotal = 0;
    for (const orderType in invoiceParameters.calculationsByOrderType) {
        const orderData = invoiceParameters.calculationsByOrderType[orderType];
        if(orderType === 'MISCELLANEOUS' ) {
            if(Array.isArray(orderData) && orderData.length){
                totalSubTotal += orderData.reduce((acc, current) => acc + current.amount, 0);
            } 
        }
        else {
            totalSubTotal += orderData.amount;
        }
        
    }
    const tax_amount = (taxRate * totalSubTotal) / 100;
    const totalWithTax = totalSubTotal + tax_amount;

    let totalSubTotal_item = totalSubTotal;
    let taxAmount_item = tax_amount;
    let totalWithTax_item = totalWithTax;
    if (invoiceParameters?.validItem.length > 0) {
        totalSubTotal_item += validItem.reduce((acc, current) => acc + current.deductableAmount, 0);
        taxAmount_item += validItem.reduce((acc, current) => acc + Number(current.tax), 0);
        totalWithTax_item = totalSubTotal_item + taxAmount_item;
    }

    const finalData = {
        calculationsByOrderType: invoiceParameters.calculationsByOrderType,
        totalSubTotal : totalSubTotal_item?.toFixed(2),
        tax_amount : taxAmount_item?.toFixed(2),
        totalWithTax : totalWithTax_item?.toFixed(2),
        totalOrdersCount: invoiceParameters?.totalOrdersCount,
        cardPaymentCount: invoiceParameters?.cardPaymentCount,
        cashPaymentCount: invoiceParameters?.cashPaymentCount,
        cardPaymentAmount: invoiceParameters?.cardPaymentAmount,
        openingBalance: invoiceParameters?.openingBalance,
        currentInvoiceCount: invoiceParameters?.currentInvoiceCount,
        cashPaymentAmount: invoiceParameters?.cashPaymentAmount,
        totalSales: invoiceParameters?.totalSales,
        merchantItemIds: invoiceParameters?.merchantItemIds,
        invoiceDate: invoiceParameters?.invoiceDate,
        validItem: invoiceParameters?.validItem,
        taxRate: taxRate
    }
    return finalData
}

const createPDF = async (fileName, merchant, fromDate, toDate, finalData, invoiceId, isEditInvoice) => {

    const logoImagePath = path.join(__dirname, './swishr_logo.jpg');
    const logoImage = fs.readFileSync(logoImagePath).toString('base64');
    const merchantAccountRef = `SWSH-${moment.tz(merchant?.registrationDate, timeZone).format('DDMMYY')}-${String(merchant.merchantId).padStart(4, '0')}`;
    const invoiceDate = !isEditInvoice ? moment.tz(timeZone).toDate() : finalData?.invoiceDate || moment.tz(timeZone).toDate();

    const totalSubTotal = Number(finalData.totalSubTotal) || 0;
    const taxAmount = Number(finalData.tax_amount) || 0;
    const totalWithTax = Number(finalData.totalWithTax) || 0;
    const amountToReceive = finalData.amountToRecieve || { total: 0, cashPayment: 0, bankPayment: 0 };

    const totalOrdersCount = finalData?.totalOrdersCount || Object.values(finalData?.calculationsByPaymentType).reduce((acc, current) => acc + current.totalOrders, 0) || 0;
    const deliveryOrderCount = finalData?.calculationsByOrderType?.DELIVERY?.totalOrders || 0;
    const collectionOrderCount = finalData?.calculationsByOrderType?.COLLECTION?.totalOrders || 0;
    const cardPaymentCount = finalData?.cardPaymentCount || finalData?.calculationsByPaymentType?.CARD?.totalOrders || 0;
    const cashPaymentCount = finalData?.cashPaymentCount || finalData?.calculationsByPaymentType?.CASH?.totalOrders || 0;
    const cardPaymentAmount = finalData?.cardPaymentAmount || finalData?.calculationsByPaymentType?.CARD?.totalOrderValue || 0;

    let totalSales = !isEditInvoice ? 0 : finalData?.totalSales || 0;
    let cashPaymentAmount = !isEditInvoice ? 0 : finalData?.cashPaymentAmount || 0

    if(!isEditInvoice){
        if (finalData?.calculationsByOrderType?.DELIVERY) {
            totalSales += finalData?.calculationsByOrderType?.DELIVERY?.totalOrderValue
        }
        if (finalData?.calculationsByOrderType?.COLLECTION) {
            totalSales += finalData?.calculationsByOrderType?.COLLECTION?.totalOrderValue
        }
        if (finalData?.calculationsByOrderType?.SERVICE_FEE?.isCashOrders) {
            totalSales += finalData?.calculationsByOrderType?.SERVICE_FEE?.totalOrderValue
        }
        if (finalData?.calculationsByOrderType?.DELIVERY_CHARGE?.isCashOrders) {
            totalSales += finalData?.calculationsByOrderType?.DELIVERY_CHARGE?.totalOrderValue
        }

        cashPaymentAmount = totalSales - cardPaymentAmount
    }

    const merchantItem = await MerchantItemsModal.find({ merchantId: merchant.merchantId })
    let validItem = !isEditInvoice ? [] : finalData?.validItem;
    let totalSubTotal_item = totalSubTotal;
    let taxAmount_item = taxAmount;
    let totalWithTax_item = totalWithTax

    if (merchantItem.length > 0 && !isEditInvoice) {
        validItem = merchantItem.filter(item => !item.isWaivedOff && item.balanceAmount > 0);
        if (validItem.length > 0) {
            validItem = validItem.map(item => {
                const plainItem = item.toObject();
                const tax = (plainItem.deductableAmount * merchant.taxRate) / 100;
                return { ...plainItem, tax: Number(tax.toFixed(2)) };
            });
            totalSubTotal_item += validItem.reduce((acc, current) => acc + current.deductableAmount, 0);
            taxAmount_item += validItem.reduce((acc, current) => acc + Number(current.tax), 0);
            totalWithTax_item = totalSubTotal_item + taxAmount_item;
        }
    } 
    const totalToBePaid = totalSales - totalWithTax_item
    const bankTransfer = totalToBePaid - cashPaymentAmount
    let closingBalance = 0

    const lastInvoice = await InvoiceModal.findOne({ merchantId: merchant.merchantId }).sort({ createdAt: -1 });
    const openingBalance = isEditInvoice ? finalData.openingBalance : lastInvoice ? (Number(lastInvoice.invoiceParameters?.closingBalance) || 0) : 0;

    const lastInvoiceId = lastInvoice ? lastInvoice.invoiceId : null;
    let lastInvoiceCount = !isEditInvoice ? 0 : finalData?.currentInvoiceCount - 1 || 0;
    if (lastInvoiceId && !isEditInvoice) {
        const lastInvoiceIdWithLeadingZeros = lastInvoiceId.split('-').pop();
        lastInvoiceCount = parseInt(lastInvoiceIdWithLeadingZeros, 10) || 0;
    }

    const remainingAmount = - openingBalance + cardPaymentAmount - totalWithTax_item
    if (remainingAmount > 0) {
        closingBalance = 0
    }
    else {
        closingBalance = - remainingAmount
    }

    const docDefinition = {
        content: [
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Invoice no. ${invoiceId}`, style: 'header', alignment: 'right' },

            {
                table: {
                    widths: ['*', 'auto'], // Left column takes remaining space, right column auto width
                    body: [
                        [
                            // Merchant Details (Left Side)
                            {
                                stack: [
                                    { text: `${merchant.merchantName}`, style: 'subheader', alignment: 'left' },
                                    { text: `${merchant.merchantAddress}`, style: 'subheader', alignment: 'left' },
                                    { text: `${merchant.merchantArea}`, style: 'subheader', alignment: 'left' },
                                    { text: `${merchant.merchantPost}`, style: 'subheader', alignment: 'left' },
                                ],
                            },
                            // Swishr Details (Right Side)
                            {
                                stack: [
                                    { text: `Swishr`, style: 'subheader', alignment: 'right' },
                                    { text: `128 City Road`, style: 'subheader', alignment: 'right' },
                                    { text: `London`, style: 'subheader', alignment: 'right' },
                                    { text: `EC1V 2NX`, style: 'subheader', alignment: 'right' },
                                    { text: `VAT Number: 467 7930 40`, style: 'subheader', alignment: 'right' },
                                    { text: `Tel: 0207 046 1829`, style: 'subheader', alignment: 'right' },
                                    { text: `e-Mail: Restaurants@Swishr.co.uk`, style: 'subheader', alignment: 'right', link: 'mailto: restaurants@Swishr.co.uk' },
                                ],
                            },
                        ],
                    ],
                },
                margin: [0, 5],
                layout: 'noBorders', // Optional: Remove borders for a cleaner look
            },

            { text: `Invoice date: ${moment.tz(invoiceDate, timeZone).format('Do MMMM YYYY')}`, style: 'subheader', alignment: 'right', margin: [0, 5, 0, 20] },

            { text: `Period: ${moment.tz(fromDate, timeZone).format('Do MMMM YYYY')} - ${moment.tz(toDate, timeZone).format('Do MMMM YYYY')}\n\n`, style: 'subheader', alignment: 'left', margin: [0, 30, 0, 0] },

            // Order Type Calculations Table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: 'Description', bold: true, style: 'subheader', },
                            { text: 'Amount', bold: true, style: 'subheader', },
                        ],
                        ...Object.entries(finalData.calculationsByOrderType).filter(([orderType]) => orderType !== 'MISCELLANEOUS').map(([orderType, data]) => {
                            const totalOrderValue = data.totalOrderValue || 0; // Default to 0
                            const amount = data.amount || 0; // Default to 0
                            let description = '';
                            // Set description based on orderType
                            if (orderType === 'COLLECTION') {
                                description = `${data.commissionRate}% Commission on Collection Orders value £${totalOrderValue.toFixed(2)} (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DELIVERY') {
                                description = `${data.commissionRate}% Commission on Delivery Orders value £${totalOrderValue.toFixed(2)} (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'SERVICE_FEE' && !data.isCashOrders) {
                                description = `Service Fee Paid (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'SERVICE_FEE' && data.isCashOrders) {
                                description = `Service Fee Paid By Cash Orders (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DELIVERY_CHARGE' && !data.isCashOrders) {
                                description = `Delivery Charge (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DELIVERY_CHARGE' && data.isCashOrders) {
                                description = `Delivery Charge Paid By Cash Orders (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DRIVER_TIP') {
                                description = `Driver Tip (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            }

                            return [
                                { text: description, margin: [0, 2] },
                                { text: `£${amount.toFixed(2)}`, margin: [0, 2] },
                            ];
                        }),
                        ...(finalData.calculationsByOrderType?.MISCELLANEOUS ? finalData.calculationsByOrderType?.MISCELLANEOUS.map(misc => [
                            { text: `${misc?.text || ''}`, margin: [0, 2] },
                            { text: `£${misc.amount}`, margin: [0, 2] }
                        ])
                            : []
                        ),
                        ...(validItem.length > 0 ? validItem.map(item => [
                            { text: `${item.itemName}, ${item.totalQuantity} Qty (Remaining £${item.balanceAmount})`, margin: [0, 2] },
                            { text: `£${item.deductableAmount}`, margin: [0, 2] }
                        ])
                            : [])
                    ],
                },
                margin: [0, 5, 0, 30],
            },

            {
                margin: [0, 70, 0, 10],
                table: {
                    widths: ['60%', '29%', 'auto'],
                    heights: [20, 20, 20],
                    body: [
                        [
                            {},
                            { text: 'Subtotal:', style: 'subheader', alignment: 'left' },
                            { text: `£${totalSubTotal_item?.toFixed(2)}`, style: 'textNormal', alignment: 'left' },
                        ],
                        [
                            {},
                            { text: 'VAT:', style: 'subheader', alignment: 'left' },
                            { text: `£${taxAmount_item?.toFixed(2)}`, style: 'textNormal', alignment: 'left' },
                        ],
                        [
                            {},
                            { text: 'Total Inc. VAT:', style: 'subheader', alignment: 'left' },
                            { text: `£${totalWithTax_item?.toFixed(2)}`, style: 'textNormal', alignment: 'left' },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                },
            },
            {
                text: `You don’t need to do anything, this will automatically be deducted in your Swishr Account statement.\n\n128 City Road, London, EC1V 2NX`,
                alignment: 'center',
                fontSize: 10,
                absolutePosition: { x: 0, y: 760 }, // Adjust y position as needed (bottom of the page)
                width: '100%', // Full width
                bold: true
            },

            {
                text: '', // Empty text to create space for page break
                pageBreak: 'before', // This will force the next content to start on a new page
            },

            // Second Page
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Period: ${moment(fromDate).format('Do MMMM YYYY')} - ${moment(toDate).format('Do MMMM YYYY')}`, style: 'header', alignment: 'right' },
            { text: `Account Ref: ${merchantAccountRef}`, style: 'header', alignment: 'right', margin: [0, 0] },
            { text: "Summary", style: 'header', alignment: 'center', margin: [0, 30, 0, 20] },

            {
                table: {
                    widths: ["60%", "40%"],
                    body: [
                        [{ text: "Total Orders", style: 'tableHeader', margin: [0, 2] }, { text: totalOrdersCount, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: "Delivery Orders", style: 'tableHeader', margin: [0, 2] }, { text: deliveryOrderCount, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: "Collection Orders", style: 'tableHeader', margin: [0, 2] }, { text: collectionOrderCount, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: `${cardPaymentCount} Card Payments`, style: 'tableHeader', margin: [0, 2] }, { text: `£${cardPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: `${cashPaymentCount} Cash Payments (Including Service & Delivery Charges)`, style: 'tableHeader', margin: [0, 2] }, { text: `£${cashPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: "Total Sales", style: 'tableHeader', margin: [0, 2] }, { text: `£${totalSales?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: `Total To Be Paid This Week After All Deductions\n\n £${totalToBePaid?.toFixed(2)}`, style: 'tableHeader', margin: [0, 2] }, { text: `£${bankTransfer?.toFixed(2)} will be paid via Bank Transfer\n\n £${cashPaymentAmount?.toFixed(2)} Paid via Cash Order Payments`, style: 'tableText', margin: [0, 2] }],
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return (rowIndex % 2 === 0) ? '#F1F1F1' : null;
                    }
                }
            },

            {
                text: '', // Empty text to create space for page break
                pageBreak: 'before', // This will force the next content to start on a new page
            },

            //Third Page
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Period: ${moment(fromDate).format('Do MMMM YYYY')} - ${moment(toDate).format('Do MMMM YYYY')}`, style: 'header', alignment: 'right' },
            { text: `Account Ref: ${merchantAccountRef}`, style: 'header', alignment: 'right', margin: [0, 0] },
            { text: "Account Statement", style: 'header', alignment: 'center', margin: [0, 30, 0, 5] },
            {
                margin: [0, 20],
                table: {
                    widths: ["60%", "40%"],
                    body: [
                        [{ text: "Account Balance", style: 'tableHeader', margin: [0, 3] }, { text: `-£${closingBalance.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }],
                        ...(validItem.length > 0 ? validItem.map(item => {
                            const amt = item.balanceAmount - item.deductableAmount - Number(item.tax)
                            return [
                                { text: `${item.itemName} (Remaining Amount)`, style: 'tableHeader', margin: [0, 3] },
                                { text: `-£${amt?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                            ]
                        })
                            : [])
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "#F1F1F1";
                    }
                }
            },

            {
                margin: [0, 20],
                table: {
                    headerRows: 1,
                    widths: ["25%", "50%", "25%"],
                    body: [
                        [
                            { text: 'Date', bold: true, style: 'subheader', margin: [0, 3] },
                            { text: 'Description', bold: true, style: 'subheader', margin: [0, 3] },
                            { text: 'Amount', bold: true, style: 'subheader', margin: [0, 3] },
                        ],
                        [
                            { text: `${moment(fromDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: 'Opening Balance', style: 'tableText', margin: [0, 3] },
                            { text: `-£${openingBalance?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        [
                            { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: 'Cash Order Payments Received', style: 'tableText', margin: [0, 3] },
                            { text: `£${cashPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        [
                            { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: 'Cash Orders Paid to Merchant', style: 'tableText', margin: [0, 3] },
                            { text: `-£${cashPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        ...(cardPaymentAmount > 0
                            ? [
                                [
                                    { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                                    { text: 'Card Order Payments Received', style: 'tableText', margin: [0, 3] },
                                    { text: `£${cardPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] },
                                ],
                            ]
                            : []),
                        [
                            { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: `Invoice - ${lastInvoiceCount + 1}`, style: 'tableText', margin: [0, 3] },
                            { text: `-£${totalWithTax_item?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        ...(remainingAmount > 0
                            ? [
                                [
                                    { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                                    { text: 'Remaining Balance Transferred to Merchant', style: 'tableText', margin: [0, 3] },
                                    { text: `-£${remainingAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] },
                                ],
                            ]
                            : []),
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return (rowIndex % 2 === 0) ? '#F1F1F1' : null;
                    }
                }
            },

            {
                margin: [0, 20],
                table: {
                    widths: ["60%", "40%"],
                    body: [
                        [{ text: "Closing Balance", style: 'tableHeader', margin: [0, 3] }, { text: `-£${closingBalance.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }]
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "#F1F1F1";
                    }
                }
            }

        ],
        styles: {
            header: { fontSize: 16, bold: true, margin: [0, 10] },
            subheader: { fontSize: 14, bold: true, margin: [0, 2] },
            textNormal: { fontSize: 14, margin: [0, 2] },
            tableHeader: { fontSize: 12, bold: true },
            tableText: { fontSize: 12 },
        },
        defaultStyle: {
            columnGap: 20
        },
        footer: (currentPage, pageCount) => {
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'center',
                fontSize: 10,
                margin: [0],
            };
        },

    };

    let merchantItemIds = !isEditInvoice ? [] : finalData?.merchantItemIds || [];
    if (validItem.length > 0) {
        const updates = [];   
        for (const item of validItem) {
            const itemData = await MerchantItemsModal.findOne({ itemId: item.itemId });   
            if (itemData) {
                const amt = item.deductableAmount + item.tax;
                if(!isEditInvoice){
                    itemData.transactions.push({
                        date: moment.tz(timeZone).toDate(),
                        amount: Number(amt.toFixed(2)),
                        isPaid: false,
                        invoiceId: invoiceId,
                    });
                    merchantItemIds.push(item.itemId);
                }   
                else {
                    const transactionIndex = itemData.transactions.findIndex((transaction) => transaction.invoiceId === invoiceId);
                    if (transactionIndex !== -1) {
                        itemData.transactions[transactionIndex].amount = Number(amt.toFixed(2));
                        itemData.transactions[transactionIndex].date = moment.tz(timeZone).toDate();
                    }
                } 
                
                updates.push(itemData.save());
            }
        }
        await Promise.all(updates);
    }
    

    // Generate PDF and save it
    const pdfDoc = pdfMake.createPdf(docDefinition);
    return new Promise((resolve, reject) => {
        pdfDoc.getBuffer(async (buffer) => {
            const pdfUrl = await uploadPdfBuffer(buffer, fileName);
            resolve({
                pdfUrl: pdfUrl,
                invoiceParameters: {
                    totalSales: totalSales,
                    totalOrdersCount: totalOrdersCount || 0,
                    deliveryOrderCount: deliveryOrderCount || 0,
                    collectionOrderCount: collectionOrderCount || 0,
                    cardPaymentCount: cardPaymentCount || 0,
                    cashPaymentCount: cashPaymentCount || 0,
                    cardPaymentAmount: Number(cardPaymentAmount?.toFixed(2)) || 0,
                    cashPaymentAmount: Number(cashPaymentAmount?.toFixed(2)) || 0,
                    deliveryOrderValue: finalData?.calculationsByOrderType?.DELIVERY?.totalOrderValue || 0,
                    collectionOrderValue: finalData?.calculationsByOrderType?.COLLECTION?.totalOrderValue || 0,
                    calculationsByOrderType: finalData.calculationsByOrderType,
                    totalSubTotal: Number(totalSubTotal_item?.toFixed(2)),
                    taxAmount: Number(taxAmount_item?.toFixed(2)),
                    totalWithTax: Number(totalWithTax_item?.toFixed(2)),
                    closingBalance: Number(closingBalance.toFixed(2)),
                    validItem: validItem || [],
                    currentInvoiceCount: lastInvoiceCount + 1,
                    cashPaymentAmount: Number(cashPaymentAmount?.toFixed(2)),
                    totalSales: Number(totalSales?.toFixed(2)),
                    openingBalance: Number(openingBalance?.toFixed(2)),
                    merchantItemIds: merchantItemIds,
                    invoiceDate: invoiceDate,
                    fileName: fileName
                },
            });
        });
    });
};

module.exports = {generateInvoiceId,calculateInvoiceParameters, calculateOrderValues, getFinalDataForEditInvoice, createPDF };