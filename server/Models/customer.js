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
    configDetails: {
      serviceFee: {
        isApplicable: {
          type: Boolean,
          default: true,
        },
        value: {
          type: Number,
          default: 0,
        },
      },
      deliveryCharge: {
        isApplicable: {
          type: Boolean,
          default: true,
        },
        value: {
          type: Number,
          default: 0,
        },
      },
      driverTip: {
        isApplicable: {
          type: Boolean,
          default: true,
        },
        value: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', CustomerSchema);
