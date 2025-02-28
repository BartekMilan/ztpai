const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Publiczne endpointy
router.post('/register', userController.register);
router.post('/login', userController.login);

// Chronione endpointy
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;