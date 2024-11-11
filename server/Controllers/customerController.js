const CustomerModel = require('../Models/customer'); 

exports.addCustomer = async (req, res) => {
  const { customerId, customerName, customerEmail, customerMobile, customerAddress, configDetails } = req.body;
  try {
    // Check if a customer with the same customerId already exists
    const existingCustomer = await CustomerModel.findOne({ customerId });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this ID already exists' });
    }

    // Create a new customer
    const customer = new CustomerModel({
      customerId,
      customerName,
      customerEmail,
      customerMobile, 
      customerAddress,
      configDetails,
    });

    await customer.save();
    res.status(201).json({ message: 'Customer added successfully', customer });
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
    const { customerId, customerName, customerEmail, customerMobile, customerAddress, configDetails } = req.body;
    try {
      const customer = await CustomerModel.findById(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      customer.customerId = customerId;
      customer.customerName = customerName;
      customer.customerEmail = customerEmail;
      customer.customerMobile = customerMobile;
      customer.customerAddress = customerAddress;   
      customer.configDetails = configDetails;
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
      const customer = await CustomerModel.findByIdAndDelete(id);
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
  