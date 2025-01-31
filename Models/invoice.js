const mongoose = require('mongoose');

// Define the schema for the Invoice
const invoiceSchema = new mongoose.Schema({
    merchantId: { type: Number, ref: 'Merchant', required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    downloadLink: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    invoiceParameters: { type: Object, required: true },
    status: { type: String,  enum: ['PAID', 'UNPAID'], default: 'UNPAID' },
    updatedAt: {type: Date, default: Date.now},
    invoiceId: {type: String, required: true}
});

module.exports = mongoose.model('Invoice', invoiceSchema);
