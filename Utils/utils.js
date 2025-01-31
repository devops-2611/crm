const IdGenerator = require('../Models/idGenerator');

const getNextId = async (name, start = 1) => {
    const counter = await IdGenerator.findOneAndUpdate(
        { name },                            // Find the counter by name (e.g., "customerId")
        { $inc: { seq: 1 } },                // Increment the sequence
        { new: true, upsert: true }          // Create the counter if it doesn't exist
    );

    // If the counter was newly created, initialize the sequence to the start value
    if (counter.seq < start) {
        counter.seq = start;
        await counter.save();
    }

    return counter.seq;
};

module.exports = { getNextId };
