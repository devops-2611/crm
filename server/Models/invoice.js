const mongoose = require('mongoose');

// Define the schema for the Invoice
const invoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        required: true
    },
    customerId: {
        type: Number,
        required: true
    },
    calculationsByOrderType: {
        type: Map,
        of: Object,
        required: true
    },
    calculationsByPaymentType: {
        type: Map,
        of: Object,
        required: true
    },
    totalSubTotal: {
        type: Number,
        required: true
    },
    tax_amount: {
        type: Number,
        required: true
    },
    totalWithTax: {
        type: Number,
        required: true
    },
    totalSalesValue: {
        type: Number,
        required: true
    },
    amountToRecieve: {
        type: Number,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    storeName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
