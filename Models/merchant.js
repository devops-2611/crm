const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema(
  {
    merchantId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    merchantName: {
      type: String,
      required: true,
    },
    merchantEmail: {
      type: String,
      match: /.+\@.+\..+/,
    },
    merchantMobile: {
      type: String,
    },
    merchantAddress: {
      type: String,
    },
    merchantArea: {
      type: String,
    },
    merchantPost: {
      type: mongoose.Schema.Types.Mixed, // Allows any type
    },
    serviceFeeApplicable: {
      type: Boolean,
      default: true
    },
    deliveryChargeApplicable: {
      type: Boolean,
      default: true
    },
    driverTipApplicable: {
      type: Boolean,
      default: true
    },
    deliveryOrdersComission: { type: Number },
    collectionOrdersComission: { type: Number },
    eatInComission: { type: Number },
    logoImg: { type: String },
    registrationDate: { type: Date, default: Date.now },
    registrationMethod: { type: String },
    zone: { type: String },
    totalOrders: { type: Number, default: 0 },
    taxRate: { type: Number, default: 20 },
    isActive: {type: Boolean, default: true},
    rating: {type: Number}
  },
  
  { timestamps: true }
);

module.exports = mongoose.model('Merchant', MerchantSchema);
