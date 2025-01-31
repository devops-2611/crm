const multer = require('multer');
const express = require('express');
const { getInvoicesByMerchantId, generateInvoiceByMerchantIds, getAllInvoices, editInvoice, deleteInvoice} = require('../Controllers/invoiceController');
const router = express.Router();

router.get('/getInvoicesByMerchantId', getInvoicesByMerchantId);
router.post('/generateInvoiceByMerchantIds', generateInvoiceByMerchantIds);
router.get('/getAllInvoices', getAllInvoices);
router.put('/edit-invoice', editInvoice);
router.delete('/delete-invoice', deleteInvoice);


module.exports = router;