const express = require('express');
const {getAllMerchantDetails, addMerchant, editMerchant, deleteMerchant, getMerchantDetailsById, searchMerchant, getMerchantItemDetails, addMerchantItemDetails, editMerchantItemDetails, deleteMerchantItem } = require('../Controllers/merchantController');
const router = express.Router();


router.get('/getAllMerchantDetails', getAllMerchantDetails);
router.post('/add-merchant', addMerchant);
router.put('/edit-merchant', editMerchant);
router.delete('/delete-merchant', deleteMerchant);
router.get('/getMerchantDetailsById/:id', getMerchantDetailsById);
router.get('/searchMerchant', searchMerchant);
router.get('/getMerchantItemDetails', getMerchantItemDetails);
router.post('/add-merchant-item', addMerchantItemDetails);
router.post('/edit-merchant-item', editMerchantItemDetails );
router.delete('/delete-merchant-item', deleteMerchantItem);


module.exports = router;