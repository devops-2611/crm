const multer = require('multer');
const express = require('express');
const { UploadAndParseDocument, GetAllOrders, UpdateOrder, DeleteOrder, AddOrders} = require('../Controllers/orderController');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/uploadAndParseDocument', upload.array('files', 10), UploadAndParseDocument);
router.get('/getAllOrders', GetAllOrders)
router.put('/updateOrder', UpdateOrder)
router.delete('/deleteOrder', DeleteOrder)
router.post('/addOrders', AddOrders)

module.exports = router;