const mongoose = require('mongoose');

// Define the schema for the Invoice
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    orderDate: {
        type: String,
        required: true
    },
    customerId: {
        type: Number,
        required: true
    },
    customerFirstName: {
        type: String,
    },
    customerLastName: {
        type: String,
    },
    orderType: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    confirmationStatus: {
        type: String,
        required: true
    },
    promoCode: {
        type: String,
    },
    promoDiscount: {
        type: Number,
    },
    orderDiscount: {
        type: Number,
    },
    driverTip: {
        type: Number,
    },
    deliveryCharge: {
        type: Number,
    },
    serviceFee: {
        type: Number,
    },
    surCharge: {
        type: Number,
    },
    subTotal: {
        type: Number,
    },
    taxes: {
        type: Number,
    },
    total: {
        type: Number,
    },
    branchName:{
        type: String
    },
    merchantId: {
        type: String
    },  
    status: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Orders', orderSchema);
