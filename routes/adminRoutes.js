const express = require('express');
const adminController = require('../controllers/adminController');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);

// Protected routes (require authentication)
router.get('/verify', authenticateAdmin, adminController.verifyToken);
router.get('/profile', authenticateAdmin, adminController.getProfile);
router.post('/change-password', authenticateAdmin, adminController.changePassword);

// Super admin only routes
router.get('/all', authenticateAdmin, adminController.getAllAdmins);
router.post('/create', authenticateAdmin, adminController.createAdmin);
router.put('/update/:id', authenticateAdmin, adminController.updateAdmin);
router.delete('/delete/:id', authenticateAdmin, adminController.deleteAdmin);

module.exports = router;