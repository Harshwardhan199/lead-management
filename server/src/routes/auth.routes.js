const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { registerValidation, loginValidation } = require('../validators/auth.validator');

const router = express.Router();

// Public auth routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected auth route
router.get('/me', authenticate, authController.getMe);

module.exports = router;
