const express = require('express');
const router = express.Router();
const quickLinkController = require('../controllers/quickLinkController');
const authenticateAdmin = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', quickLinkController.getAllLinks);
router.get('/category/:category', quickLinkController.getLinksByCategory);
router.get('/:id', quickLinkController.getLinkById);

// Admin only routes (require authentication)
router.post('/', authenticateAdmin, quickLinkController.createLink);
router.put('/:id', authenticateAdmin, quickLinkController.updateLink);
router.delete('/:id', authenticateAdmin, quickLinkController.deleteLink);
router.put('/order/update', authenticateAdmin, quickLinkController.updateDisplayOrder);
router.get('/admin/categories', authenticateAdmin, quickLinkController.getAllCategories);

module.exports = router;