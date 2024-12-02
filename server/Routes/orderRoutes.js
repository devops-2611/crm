const multer = require('multer');
const express = require('express');
const { UploadAndParseDocument, GetAllOrders} = require('../Controllers/orderController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/uploadAndParseDocument', upload.array('files', 10), UploadAndParseDocument);
router.get('/getAllOrders', GetAllOrders)


module.exports = router;