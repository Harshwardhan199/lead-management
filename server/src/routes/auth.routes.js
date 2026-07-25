const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { registerValidation, loginValidation } = require('../validators/auth.validator');

const router = express.Router();

// Public auth routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected auth routes
router.get('/me', authenticate, authController.getMe);
router.get('/users', authenticate, authController.getAllUsers);

// Admin-only RBAC route
router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! Access granted to administrative resource.',
    data: { user: req.user },
  });
});

module.exports = router;
