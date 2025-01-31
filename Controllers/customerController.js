const fs = require('fs');
const path = require('path');
const CustomerModal = require('../Models/customer');
const { deleteBlob, uploadBase64Image } = require('../azureBlobHelper');
const { getNextId } = require('../Utils/utils');

exports.addCustomer = async (req, res) => {
  const { customerFirstName, customerLastName, customerEmail, customerMobile, customerAddress, customerArea, customerPost, profileImg, registrationDate, registrationMethod, dob, zone, merchantId } = req.body;
  try {
    // Check if a customer with the same customerId already exists
    const existingCustomer = await CustomerModal.findOne({ 'personalDetails.email': customerEmail });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this Email already exists', success: false, errors: [] });
    }

    const customerId = await getNextId('customerId', 100);

    const matches = profileImg?.match(/^data:(image\/([^;]+));base64,(.+)$/);

    let imageUrl;

    if (!matches) {
      // return res.status(400).json({ message: 'Invalid image format', success: false, errors: [] });
    }
    else {
      const imageType = matches[2]; // e.g., 'png', 'jpeg'
      const imgName = `customer_${customerId.toString()}.${imageType}`;
      imageUrl = await uploadBase64Image(profileImg, imgName);
    }

    // Create a new customer
    const customer = new CustomerModal({
      customerId,
      merchantId,
      personalDetails: {
        firstName: customerFirstName,
        lastName: customerLastName,
        email: customerEmail,
        mobile: customerMobile,
        address: customerAddress,
        area: customerArea,
        post: customerPost,
        profileImg: imageUrl || null,
        dob: dob || null,
      },
      registrationDate: registrationDate || Date.now(),
      registrationMethod: registrationMethod || 'Web', // Default to 'Web' if not provided
      zone: zone || 'London',
    });

    await customer.save();
    res.status(200).json({ message: 'Customer added successfully', customer, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllCustomerDetails = async (req, res) => {
  try {
    const { customerId, customerFirstName, customerLastName, customerEmail, customerMobile, zone, startDate, endDate, merchantId, pageNo = 1, limit = 10, sort } = req.query

    const page = parseInt(pageNo, 10) || 1;
    const limitValue = parseInt(limit, 10) || 10;

    const matchStage = {};

    // Add filters dynamically
    if (merchantId) {
      const merchantIds = merchantId.split(',').map(id => parseInt(id.trim(), 10));
      matchStage.merchantId = { $in: merchantIds };
    }
    if (customerId) {
      const customerIds = customerId.split(',').map(id => parseInt(id, 10));
      matchStage.customerId = { $in: customerIds };
    }
    if (zone) matchStage.zone = { $in: zone.split(',') };
    if (customerFirstName) {
      matchStage['personalDetails.firstName'] = { $regex: customerFirstName, $options: 'i' };
    }
    if (customerLastName) {
      matchStage['personalDetails.lastName'] = { $regex: customerLastName, $options: 'i' };
    }
    if (customerEmail) {
      matchStage['personalDetails.email'] = { $regex: customerEmail, $options: 'i' };
    }
    if (customerMobile) {
      matchStage['personalDetails.mobile'] = { $regex: customerMobile, $options: 'i' };
    }
    // if (searchQuery) {
    //   matchStage.$or = [
    //     { 'personalDetails.firstName': { $regex: searchQuery, $options: 'i' } },
    //     { 'personalDetails.lastName': { $regex: searchQuery, $options: 'i' } },
    //     { 'personalDetails.email': { $regex: searchQuery, $options: 'i' } },
    //     { 'personalDetails.mobile': { $regex: searchQuery, $options: 'i' } },
    //   ];
    // }

    if (startDate) {
      const start = new Date(startDate);
      let end;
      if (!endDate) {
        end = new Date();
        end.setHours(23, 59, 59, 999);
      } else {
        end = new Date(endDate);
      }

      matchStage.registrationDate = { $gte: start, $lte: end };
    }

    const sortStage = {};
    if (sort === 'ascFirstName') sortStage.customerFirstName = 1;
    if (sort === 'descFirstName') sortStage.customerFirstName = -1;
    if (sort === 'ascLastName') sortStage.customerLastName = 1;
    if (sort === 'descLastName') sortStage.customerLastName = -1;
    if (sort === 'ascRegistrationDate') sortStage.registrationDate = 1;
    if (sort === 'descRegistrationDate') sortStage.registrationDate = -1;

    // Aggregate pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders', // Match your orders collection name
          let: { customerId: { $toString: '$customerId' } }, // Convert customerId to string
          pipeline: [
            { $match: { $expr: { $eq: ['$customerId', '$$customerId'] } } }, // Match customerId
          ],
          as: 'orders',
        },
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' }, // Count orders for each customer
        },
      },
      {
        $project: {
          customerId: 1,
          merchantId: 1,
          customerFirstName: '$personalDetails.firstName',
          customerLastName: '$personalDetails.lastName',
          customerEmail: '$personalDetails.email',
          customerMobile: '$personalDetails.mobile',
          customerAddress: '$personalDetails.address',
          customerArea: '$personalDetails.area',
          customerPost: '$personalDetails.post',
          profileImg: '$personalDetails.profileImg',
          customerDOB: '$personalDetails.dob',
          registrationDate: 1,
          zone: 1,
          totalOrders: 1,
        },
      },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      { $skip: (page - 1) * limitValue },
      { $limit: limitValue },
    ];

    // Fetch data and count total customers
    const [customers, totalCount] = await Promise.all([
      CustomerModal.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      CustomerModal.countDocuments(matchStage),
    ]);

    const totalPages = Math.ceil(totalCount / limitValue);

    res.status(200).json({
      customer: customers,
      currentPage: page,
      totalPages,
      totalCount,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getAllCustomerList = async (req, res) => {
  try {
    const customers = await CustomerModal.find({}, 'customerId customerName');
    res.status(200).json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.editCustomer = async (req, res) => {
  const updates = req.body; // Array of updates

  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided', success: false, errors: [] });
    }

    const updatePromises = updates.map(async (update) => {
      const { customerId, customerFirstName, customerLastName, merchantId, customerEmail, customerMobile, customerAddress, customerArea, customerPost, profileImg, registrationDate, registrationMethod, dob, zone } = update;

      const customer = await CustomerModal.findOne({ customerId: parseInt(customerId, 10) });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found', success: false, errors: [`Customer with ID ${customerId} not found`] });
      }

      // Update fields if provided, otherwise keep existing values
      if ('customerFirstName' in update) customer.personalDetails.firstName = customerFirstName;
      if ('customerLastName' in update) customer.personalDetails.lastName = customerLastName;
      if ('merchantId' in update) customer.merchantId = merchantId;
      if ('customerEmail' in update) customer.personalDetails.email = customerEmail;
      if ('customerMobile' in update) customer.personalDetails.mobile = customerMobile;
      if ('customerAddress' in update) customer.personalDetails.address = customerAddress;
      if ('customerArea' in update) customer.personalDetails.area = customerArea;
      if ('customerPost' in update) customer.personalDetails.post = customerPost;
      if ('dob' in update) customer.personalDetails.dob = dob;
      if ('registrationDate' in update) customer.registrationDate = registrationDate;
      if ('registrationMethod' in update) customer.registrationMethod = registrationMethod;
      if ('zone' in update) customer.zone = zone;

      // Handle image update if a new image is provided
      if (profileImg && typeof profileImg === 'string') {
        const matches = profileImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ message: 'Invalid image format' });
        }

        const imageType = matches[2]; // e.g., 'png', 'jpeg'
        const imgName = `customer_${customerId.toString()}.${imageType}`;
        const imageUrl = await uploadBase64Image(profileImg, imgName);
        customer.personalDetails.profileImg = imageUrl || null;
      }

      await customer.save();
      return { customerId, success: true, message: 'Customer updated successfully' };
    });

    const results = await Promise.all(updatePromises);

    res.status(200).json({ results, success: true });
    // res.status(200).json({ message: 'Customer updated successfully', customer, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.query;
  try {
    // Parse the IDs into an array
    const ids = id.includes(',') ? id.split(',').map(Number) : [parseInt(id, 10)];

    // Fetch customers to get their profile image paths before deletion
    const customers = await CustomerModal.find({ customerId: { $in: ids } });

    if (!customers.length) {
      return res.status(404).json({
        error: 'No customer found for the given ID(s)',
        success: false,
        errors: []
      });
    }

    // Delete profile images
    for (const customer of customers) {
      const profileImgPath = customer.personalDetails.profileImg;
      if (profileImgPath) {
        await deleteBlob(profileImgPath);
      }
    }

    // Delete customers from the database
    const result = await CustomerModal.deleteMany({ customerId: { $in: ids } });

    res.status(200).json({
      message: 'Customers deleted successfully',
      deletedCount: result.deletedCount,
      success: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getCustomerById = async (req, res) => {
  const { id } = req.params; // Assuming 'id' is actually the 'customerId'
  try {
    const customer = await CustomerModal.findOne({ customerId: id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
