const express = require('express');
const { upload, uploadAndParseCSV } = require('../Controllers/invoiceController');
const router = express.Router();


router.post('/upload-getInvoiceData', upload.single('file'), uploadAndParseCSV);


module.exports = router;