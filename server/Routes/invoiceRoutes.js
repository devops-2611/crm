const multer = require('multer');
const express = require('express');
const { uploadAndParseCSV , uploadManualData, saveInvoiceData, getInvoiceByCustomerId} = require('../Controllers/invoiceController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/uploadAndGetInvoiceData', upload.array('files', 10), uploadAndParseCSV);
router.post('/uploadManuallyAndGetInvoiceData', upload.none(), uploadManualData);
router.post('/saveInvoiceData', saveInvoiceData);
router.get('/getInvoiceByCustomerId/:id', getInvoiceByCustomerId);



module.exports = router;