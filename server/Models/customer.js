const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    customerId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      match: /.+\@.+\..+/,
    },
    customerMobile: {
      type: String,
    },
    customerAddress: {
      type: String,
    },
    customerArea: {
      type: String,
    },
    customerPost: {
      type: mongoose.Schema.Types.Mixed, // Allows any type
    },
    serviceFee: {
      type: Boolean,
      default: true
    },
    deliveryCharge: {
      type: Boolean,
      default: true
    },
    driverTip: {
      type: Boolean,
      default: true
    },
    comissionRate: {
      deliveryOrdersComission: { type: Number },
      collectionOrdersComission: { type: Number },
      eatInComission: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', CustomerSchema);
