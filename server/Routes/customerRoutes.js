const express = require('express');
const {getAllCustomerDetails, getAllCustomerList, addCustomer, editCustomer, deleteCustomer, getCustomerById } = require('../Controllers/customerController');
const router = express.Router();


router.get('/getAllCustomerDetails', getAllCustomerDetails);
router.get('/getAllCustomerList', getAllCustomerList);
router.post('/add-customer', addCustomer);
router.put('/edit-customer/:id', editCustomer);
router.delete('/delete-customer/:id', deleteCustomer);
router.get('/getCustomerById/:id', getCustomerById);


module.exports = router;