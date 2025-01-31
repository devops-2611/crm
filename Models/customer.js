const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    customerId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    merchantId:{type: Number, required: true},
    personalDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String},
      email: { type: String, match: /.+\@.+\..+/, unique: true },
      mobile: { type: String, match: /^[0-9]{1,15}$/ },
      address: { type: String },
      area: { type: String },
      post: { type: mongoose.Schema.Types.Mixed },
      dob: { type: Date },
      profileImg: { type: String },
    },
    orderDetails: {
      totalOrders: { type: Number, default: 0 },
      totalSpend: { type: Number, default: 0 },
      ordersRefunded: { type: Number, default: 0 },
      ordersCancelled: { type: Number, default: 0 },
    },
    financialDetails: {
      availableVouchers: { type: [String], default: [] },
      savedCards: { type: [String], default: [] },
      walletBalance: { type: Number, default: 0 },
      walletTransactions: [
        {
          amount: { type: Number, required: true },
          date: { type: Date, default: Date.now },
          type: { type: String, enum: ['credit', 'debit'], required: true },
        },
      ],
      refundHistory: [
        {
          amount: { type: Number, required: true },
          reason: { type: String },
          date: { type: Date, default: Date.now },
        },
      ],
    },
    auditDetails: [
      {
        fieldChanged: { type: String, required: true },
        oldValue: { type: String },
        newValue: { type: String },
        changedBy: { type: String, required: true },
        dateChanged: { type: Date, default: Date.now },
      },
    ],
    contactLogs: [
      {
        contactReason: { type: String, required: true },
        details: { type: String },
        contactedBy: { type: String, required: true },
        contactDate: { type: Date, default: Date.now },
      },
    ],
    lastLogin: { type: Date },
    registrationDate: { type: Date, default: Date.now },
    registrationMethod: { type: String },
    zone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', CustomerSchema);
