const express = require('express');
const { upload, uploadAndParseCSV , uploadManualData, saveInvoiceData, getInvoiceByCustomerId} = require('../Controllers/invoiceController');
const router = express.Router();


router.post('/uploadAndGetInvoiceData', upload.array('files', 10), uploadAndParseCSV);
router.post('/uploadManuallyAndGetInvoiceData', upload.none(), uploadManualData);
router.post('/saveInvoiceData', saveInvoiceData);
router.get('/getInvoiceByCustomerId/:id', getInvoiceByCustomerId);



module.exports = router;