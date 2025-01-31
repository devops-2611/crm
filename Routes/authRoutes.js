const express = require('express');
const { registerUser, login, checkAuth, getAllUsers, createSuperAdmin } = require('../Controllers/authController');
const router = express.Router();
const multer = require('multer');
const auth = require('../Middlewares/authMiddleware');

// Multer setup
const upload = multer();

// Use multer's `upload.none()` to handle FormData without files
router.post('/register', upload.none(), registerUser);
router.post('/login', upload.none(), login);
router.get('/checkAuth', auth, checkAuth);
router.get('/getAllUsers', getAllUsers);
router.post('/create-super-admin', createSuperAdmin);

module.exports = router;