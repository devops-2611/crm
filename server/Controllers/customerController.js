const fs = require('fs');
const path = require('path');
const CustomerModal = require('../Models/customer'); 

exports.addCustomer = async (req, res) => {
  const { customerName, customerEmail, customerMobile, customerAddress, customerArea, customerPost, serviceFee, deliveryCharge, driverTip, deliveryOrdersComission, collectionOrdersComission, eatInComission,img } = req.body;
  try {
    // Check if a customer with the same customerId already exists
    const existingCustomer = await CustomerModal.findOne({ customerEmail });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this Email already exists' });
    }

    const matches = img.match(/^data:(image\/([^;]+));base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    const imageType = matches[2]; // e.g., 'png', 'jpeg'
    const imgBuffer = Buffer.from(matches[3], 'base64'); // Decode Base64 string

    const imgName = `${Date.now()}-${customerName?.split(' ')[0]?.toString()}.${imageType}`;
    const uploadDir = path.join(__dirname, '../Uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imgPath = path.join(uploadDir, imgName);
    const relativeImgPath = `/uploads/${imgName}`; // Use a relative path

    fs.writeFileSync(imgPath, imgBuffer);

    const lastCustomer = await CustomerModal.findOne().sort({ customerId: -1 });
  
    const customerId = lastCustomer ? lastCustomer.customerId + 1 : 101;
    // Create a new customer
    const customer = new CustomerModal({
      customerId,
      customerName,
      customerEmail,
      customerMobile, 
      customerAddress,
      customerArea,
      customerPost,
      serviceFee,
      deliveryCharge,
      driverTip,
      deliveryOrdersComission,
      collectionOrdersComission,
      eatInComission,
      logoImg: relativeImgPath
    });

    await customer.save();
    res.status(200).json({ message: 'Customer added successfully', customer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllCustomerDetails = async (req, res) => {
  try {
    const customers = await CustomerModal.find();
    res.status(200).json(customers);
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
    const { id } = req.params;
    const { customerId, customerName, customerEmail, customerMobile, customerAddress, customerArea, customerPost, serviceFee, deliveryCharge, driverTip, deliveryOrdersComission, collectionOrdersComission, eatInComission, img } = req.body;
    try {
      const customer = await CustomerModal.findOne({ customerId: parseInt(id) });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      customer.customerId = customerId || customer.customerId ;
      customer.customerName = customerName || customer.customerName;
      customer.customerEmail = customerEmail || customer.customerEmail;
      customer.customerMobile = customerMobile || customer.customerMobile;
      customer.customerAddress = customerAddress || customer.customerAddress;   
      customer.customerArea = customerArea || customer.customerArea;
      customer.customerPost = customerPost || customer.customerPost;
      customer.serviceFee = serviceFee || customer.serviceFee;
      customer.deliveryCharge = deliveryCharge || customer.deliveryCharge;
      customer.driverTip = driverTip || customer.driverTip;
      customer.deliveryOrdersComission = deliveryOrdersComission || customer.deliveryOrdersComission;
      customer.collectionOrdersComission = collectionOrdersComission || customer.collectionOrdersComission;
      customer.eatInComission = eatInComission || customer.eatInComission;

      // Handle image update if a new image is provided
      if (img) {
        const matches = img.match(/^data:(image\/([^;]+));base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ message: 'Invalid image format' });
        }
  
        const imageType = matches[2]; // e.g., 'png', 'jpeg'
        const imgBuffer = Buffer.from(matches[3], 'base64'); // Decode Base64 string
  
        // Delete the old image file if it exists
        if (customer.img) {
          fs.unlinkSync(path.join(__dirname, '..', customer.img));
        }
  
        // Save the new image
        const imgName = `${Date.now()}-${customerName?.split(' ')[0]?.toString()}.${imageType}`;
        const imgPath = path.join(__dirname, '../Uploads', imgName);
        fs.writeFileSync(imgPath, imgBuffer);
  
        customer.img = `/uploads/${imgName}`;
      }

      await customer.save();
      res.status(200).json({ message: 'Customer updated successfully', customer });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

  exports.deleteCustomer = async (req, res) => {    
    const { id } = req.params;
    try {
      const customer = await CustomerModal.findOneAndDelete({ customerId: parseInt(id) });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const imgPath = customer.img;

    //await CustomerModal.findByIdAndDelete(id);

    if (imgPath && fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }

      res.status(200).json({ message: 'Customer deleted successfully' });
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
  