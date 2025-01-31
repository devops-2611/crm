const mongoose = require('mongoose');

const MerchantModal = require('../Models/merchant');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected:`);
   // await addRatingToAllMerchants();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to update the rating field for all merchants
const addRatingToAllMerchants = async () => {
  try {
    const result = await MerchantModal.updateMany({}, { $set: { rating: 4 } });
    console.log(`${result.modifiedCount} merchant(s) updated with rating.`);
  } catch (error) {
    console.error(`Error updating merchants: ${error.message}`);
  }
};

module.exports = connectDB;
