const express = require('express');
const { upload, uploadAndParseCSV , saveInvoiceData} = require('../Controllers/invoiceController');
const router = express.Router();


router.post('/uploadAndGetInvoiceData', upload.single('file'), uploadAndParseCSV);
router.post('/saveInvoiceData', saveInvoiceData);



module.exports = router;