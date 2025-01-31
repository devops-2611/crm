const fs = require('fs');
const path = require('path');
const MerchantModal = require('../Models/merchant');
const InvoiceModal = require('../Models/invoice');
const MerchantItemsModal = require('../Models/merchantItems')
const { deleteBlob, uploadBase64Image } = require('../azureBlobHelper');
const { getNextId } = require('../Utils/utils');

exports.addMerchant = async (req, res) => {
  const { merchantName, merchantEmail, merchantMobile, merchantAddress, merchantArea, merchantPost, logoImg, registrationDate, registrationMethod, zone, serviceFeeApplicable, deliveryChargeApplicable, driverTipApplicable, deliveryOrdersComission, collectionOrdersComission, eatInComission, taxRate, isActive, rating } = req.body;
  try {

    // Check if the merchant with the given email (case-insensitive) already exists
    const existingMerchant = await MerchantModal.findOne({
      merchantEmail: { $regex: `^${merchantEmail}$`, $options: 'i' },
    });

    if (existingMerchant) {
      return res.status(400).json({ message: 'Merchant with this Email already exists', success: false, errors: [] });
    }

    const merchantId = await getNextId('merchantId');

    const matches = logoImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
    let imageUrl;

    if (!matches) {
      // return res.status(400).json({ message: 'Invalid image format', success: false, errors: [] });
    }
    else {
      const imageType = matches[2]; // e.g., 'png', 'jpeg'
      const imgName = `merchant_${merchantId.toString()}.${imageType}`;
      imageUrl = await uploadBase64Image(logoImg, imgName);

    }

    const merchant = new MerchantModal({
      merchantId,
      merchantName,
      merchantEmail,
      merchantMobile,
      merchantAddress,
      merchantArea,
      merchantPost,
      logoImg: imageUrl || null,
      serviceFeeApplicable,
      deliveryChargeApplicable,
      driverTipApplicable,
      deliveryOrdersComission,
      collectionOrdersComission,
      eatInComission,
      registrationDate: registrationDate || Date.now(),
      registrationMethod: registrationMethod || 'Web', // Default to 'Web' if not provided
      zone: zone || 'London',
      taxRate: taxRate || 20,
      isActive: isActive || true,
      rating
    });

    await merchant.save();
    res.status(200).json({ message: 'Merchant added successfully', merchant, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllMerchantDetails = async (req, res) => {
  try {
    const { merchantName, merchantEmail, merchantMobile, zone, startDate, endDate, merchantId, pageNo = 1, limit = 10, sort, isActive } = req.query

    const page = parseInt(pageNo, 10) || 1;
    const limitValue = parseInt(limit, 10) || 10;

    const matchStage = {};

    // Add filters dynamically
    if (merchantId) {
      const merchantIds = merchantId.split(',').map(id => parseInt(id.trim(), 10));
      matchStage.merchantId = { $in: merchantIds };
    }
    if (merchantName) {
      matchStage.merchantName = { $regex: merchantName, $options: 'i' };
    }
    if (merchantEmail) {
      matchStage.merchantEmail = { $regex: merchantEmail, $options: 'i' };
    }
    if (merchantMobile) {
      matchStage.merchantMobile = { $regex: merchantMobile, $options: 'i' };
    }
    if (zone) matchStage.zone = { $in: zone.split(',') };
    if (isActive !== undefined) {
      const activeStatus = isActive == 'true';
      matchStage.isActive = activeStatus;
    }

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
    if (sort === 'ascName') sortStage.merchantName = 1;
    if (sort === 'descName') sortStage.merchantName = -1;
    if (sort === 'ascRegistrationDate') sortStage.registrationDate = 1;
    if (sort === 'descRegistrationDate') sortStage.registrationDate = -1;

    // Aggregate pipeline
    const pipeline = [
      { $match: matchStage },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      {
        $addFields: {
          merchantIdStr: { $toString: '$merchantId' }, // Convert merchantId to string
        },
      },
      {
        $lookup: {
          from: 'orders', // Match your orders collection name
          localField: 'merchantIdStr', // Use the converted string field
          foreignField: 'merchantId', // Match the string field in orders
          as: 'orders',
        },
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
        },
      },
      { $skip: (page - 1) * limitValue },
      { $limit: limitValue },
      {
        $project: {
          orders: 0, // Exclude the actual orders details, keeping only the count
        },
      },
    ];


    // Fetch data and count total customers
    const [merchant, totalCount] = await Promise.all([
      MerchantModal.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      MerchantModal.countDocuments(matchStage),
    ]);

    for (const mer of merchant) {
      await MerchantModal.updateOne(
        { merchantId: mer.merchantId },
        { $set: { totalOrders: mer.totalOrders } } // Save totalOrders in the merchant document
      );
    }

    const totalPages = Math.ceil(totalCount / limitValue);

    res.status(200).json({
      merchant,
      currentPage: page,
      totalPages,
      totalCount,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.editMerchant = async (req, res) => {
  const updates = req.body; // Array of updates

  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided', success: false, errors: [] });
    }

    const updatePromises = updates.map(async (update) => {
      const { merchantId, merchantName, merchantEmail, merchantMobile, merchantAddress, merchantArea, merchantPost, logoImg, registrationDate, registrationMethod, zone, serviceFeeApplicable, deliveryChargeApplicable, driverTipApplicable, deliveryOrdersComission, collectionOrdersComission, eatInComission, taxRate, isActive, rating } = update;

      const merchant = await MerchantModal.findOne({ merchantId: parseInt(merchantId, 10) });

      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found', success: false, errors: [`Merchant with ID ${merchantId} not found`] });
      }

      // Update fields if provided, otherwise keep existing values

      if ('merchantName' in update) merchant.merchantName = merchantName;
      if ('merchantEmail' in update) merchant.merchantEmail = merchantEmail;
      if ('merchantMobile' in update) merchant.merchantMobile = merchantMobile;
      if ('merchantAddress' in update) merchant.merchantAddress = merchantAddress;
      if ('merchantArea' in update) merchant.merchantArea = merchantArea;
      if ('merchantPost' in update) merchant.merchantPost = merchantPost;
      if ('serviceFeeApplicable' in update) merchant.serviceFeeApplicable = serviceFeeApplicable;
      if ('deliveryChargeApplicable' in update) merchant.deliveryChargeApplicable = deliveryChargeApplicable;
      if ('driverTipApplicable' in update) merchant.driverTipApplicable = driverTipApplicable;
      if ('deliveryOrdersComission' in update) merchant.deliveryOrdersComission = deliveryOrdersComission;
      if ('collectionOrdersComission' in update) merchant.collectionOrdersComission = collectionOrdersComission;
      if ('eatInComission' in update) merchant.eatInComission = eatInComission;
      if ('registrationDate' in update) merchant.registrationDate = registrationDate;
      if ('registrationMethod' in update) merchant.registrationMethod = registrationMethod;
      if ('zone' in update) merchant.zone = zone;
      if ('taxRate' in update) merchant.taxRate = taxRate;
      if ('isActive' in update) merchant.isActive = isActive;
      if ('rating' in update) merchant.rating = rating;

      // Handle image update if a new image is provided
      if (logoImg && typeof logoImg === 'string') {
        const matches = logoImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ message: 'Invalid image format', success: false, errors: [] });
        }

        const imageType = matches[2]; // e.g., 'png', 'jpeg'
        const imgName = `merchant_${merchantId.toString()}.${imageType}`;
        const imageUrl = await uploadBase64Image(logoImg, imgName);
        merchant.logoImg = imageUrl || '';
      }

      await merchant.save();

      return { merchantId, success: true, message: 'Merchant updated successfully' };
    });

    const results = await Promise.all(updatePromises);

    res.status(200).json({ results, success: true });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteMerchant = async (req, res) => {
  const { id } = req.query;
  try {
    // Parse the IDs into an array
    const ids = id.includes(',') ? id.split(',').map(Number) : [parseInt(id, 10)];

    // Fetch customers to get their profile image paths before deletion
    const merchants = await MerchantModal.find({ merchantId: { $in: ids } });

    if (!merchants.length) {
      return res.status(404).json({
        error: 'No merchant found for the given ID(s)',
        success: false,
        errors: []
      });
    }

    for (const merchant of merchants) {
      const profileImgPath = merchant.logoImg;
      if (profileImgPath) {
        await deleteBlob(profileImgPath);
      }
    }


    const result = await MerchantModal.deleteMany({ merchantId: { $in: ids } });

    res.status(200).json({
      message: 'Merchants deleted successfully',
      deletedCount: result.deletedCount,
      success: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//InvoiceModal
exports.getMerchantDetailsById = async (req, res) => {
  const { id } = req.params;
  try {
    const merchant = await MerchantModal.findOne({ merchantId: id });
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found', success: false, errors: [`Merchant with ID ${id} not found`] });
    }

    res.status(200).json({ merchant });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.searchMerchant = async (req, res) => {
  let { searchQuery, pageNo = 1, limit = 10 } = req.query;

  try {
    const isNumeric = /^\d+$/.test(searchQuery);
    const query = isNumeric
      ? { merchantId: parseInt(searchQuery, 10) }
      : { merchantName: { $regex: searchQuery, $options: 'i' } };

    pageNo = parseInt(pageNo, 10);
    limit = parseInt(limit, 10);

    const totalCount = await MerchantModal.countDocuments(query);

    // Paginate results
    const merchants = await MerchantModal.find(query)
      .select('merchantId merchantName isActive')
      .skip((pageNo - 1) * limit)
      .limit(limit);

    if (!merchants.length) {
      return res.status(404).json({
        message: 'No merchants found',
        success: false,
        errors: [],
      });
    }

    res.status(200).json({
      merchants,
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: pageNo,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMerchantItemDetails = async (req, res) => {
  const { merchantId, pageNo = 1, limit = 10, sort } = req.query
  try {

    const page = parseInt(pageNo, 10) || 1;
    const limitValue = parseInt(limit, 10) || 10;

    const matchStage = {};

    if (merchantId) {
      const merchantIds = merchantId.split(',').map(id => parseInt(id.trim(), 10));
      matchStage.merchantId = { $in: merchantIds };
    }
    const sortStage = {};
    sortStage.issueDate = -1;
    if (sort === 'ascDate') sortStage.issueDate = 1;
    if (sort === 'descDate') sortStage.issueDate = -1;

    const pipeline = [
      { $match: matchStage },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      { $skip: (page - 1) * limitValue },
      { $limit: limitValue },
    ];

    const [items, totalCount] = await Promise.all([
      MerchantItemsModal.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      MerchantItemsModal.countDocuments(matchStage),
    ]);

    const totalPages = Math.ceil(totalCount / limitValue);

    res.status(200).json({
      items,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

exports.addMerchantItemDetails = async (req, res) => {
  const { merchantId, itemName, totalAmount, totalQuantity, deductableAmount, isWaivedOff, issueDate } = req.body;

  // Validate required fields
  if (!merchantId || !itemName || !totalAmount) {
    return res.status(400).json({ message: 'merchantId, itemName, and totalAmount are required', success: false });
  }

  const itemId = await getNextId('itemId');

  try {
    // Create a new merchant item
    const newItem = new MerchantItemsModal({
      merchantId,
      itemName,
      totalAmount : Number(totalAmount)?.toFixed(2),
      totalQuantity : Number(totalQuantity),
      balanceAmount : Number(totalAmount)?.toFixed(2),
      deductableAmount : Number(deductableAmount)?.toFixed(2),
      isWaivedOff,
      issueDate,
      itemId
    });

    await newItem.save();

    res.status(201).json({ message: 'Merchant item added successfully', item: newItem, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.editMerchantItemDetails = async (req, res) => {
  const { itemId, merchantId, itemName, totalAmount, totalQuantity, balanceAmount, deductableAmount, isWaivedOff, issueDate } = req.body;

  if (!itemId) {
    return res.status(400).json({ message: 'itemId is required', success: false });
  }

  try {

    const item = await MerchantItemsModal.findOne({ itemId });

    if (!item) {
      return res.status(404).json({ message: 'Merchant item not found', success: false });
    }

    if (merchantId) item.merchantId = merchantId;
    if (itemName) item.itemName = itemName;
    if (totalAmount) item.totalAmount = totalAmount;
    if (totalQuantity) item.totalQuantity = totalQuantity;
    if (balanceAmount !== undefined) item.balanceAmount = balanceAmount;
    if (deductableAmount) item.deductableAmount = deductableAmount;
    if (isWaivedOff !== undefined) item.isWaivedOff = isWaivedOff;
    if (issueDate) item.issueDate = issueDate;

    await item.save();

    res.status(200).json({ message: 'Merchant item updated successfully', item, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteMerchantItem = async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ message: 'itemId is required', success: false });
  }

  try {

    const item = await MerchantItemsModal.findOneAndDelete({ itemId });

    if (!item) {
      return res.status(404).json({ message: 'Merchant item not found', success: false });
    }

    res.status(200).json({ message: 'Merchant item deleted successfully', success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};