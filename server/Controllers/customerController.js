const CustomerModel = require('../Models/customer'); 

exports.addCustomer = async (req, res) => {
  const { customerName, customerEmail, customerMobile, customerAddress, customerArea, customerPost, serviceFee, deliveryCharge, driverTip } = req.body;
  try {
    // Check if a customer with the same customerId already exists
    const existingCustomer = await CustomerModel.findOne({ customerEmail });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this Email already exists' });
    }

    const lastCustomer = await CustomerModel.findOne().sort({ customerId: -1 });
  
    const customerId = lastCustomer ? lastCustomer.customerId + 1 : 101;
    // Create a new customer
    const customer = new CustomerModel({
      customerId,
      customerName,
      customerEmail,
      customerMobile, 
      customerAddress,
      customerArea,
      customerPost,
      serviceFee,
      deliveryCharge,
      driverTip
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
    const customers = await CustomerModel.find();
    res.status(200).json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllCustomerList = async (req, res) => {
    try {
      const customers = await CustomerModel.find({}, 'customerId customerName'); 
      res.status(200).json(customers);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

  exports.editCustomer = async (req, res) => {
    const { id } = req.params;
    const { customerId, customerName, customerEmail, customerMobile, customerAddress, customerArea, customerPost, serviceFee, deliveryCharge, driverTip } = req.body;
    try {
      const customer = await CustomerModel.findOne({ customerId: parseInt(id) });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      customer.customerId = customerId;
      customer.customerName = customerName;
      customer.customerEmail = customerEmail;
      customer.customerMobile = customerMobile;
      customer.customerAddress = customerAddress;   
      customer.customerArea = customerArea;
      customer.customerPost = customerPost;
      customer.serviceFee = serviceFee;
      customer.deliveryCharge = deliveryCharge;
      customer.driverTip = driverTip;
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
      const customer = await CustomerModel.findOneAndDelete({ customerId: parseInt(id) });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
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
      const customer = await CustomerModel.findOne({ customerId: id }); 
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.status(200).json(customer);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  