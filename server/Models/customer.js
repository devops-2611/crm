const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    
  customerId:{
    type: Number,
    required: true,
    unique: true, 
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
  },
  customerMobile: {
    type: String,
  },
  customerAddress: {
    type: String,
  },
  configDetails:{
    serviceFee:{
      type: Number,
    },
    deliveryCharge:{
      type: Number,
    },
    driverTip:{
      type: Number,
    },
    surCharge:{
      type: Number,
    },
    orderDiscount:{
      type: Number,
    }
  }
});

module.exports = mongoose.model('Customer', CustomerSchema);
