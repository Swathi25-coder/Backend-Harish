const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const authenticateAdmin = require('../middleware/auth');  // Changed this line

// Public routes (no authentication required)
router.get('/', newsController.getAllNews);
router.get('/ticker', newsController.getTickerNews);
router.get('/:id', newsController.getNewsById);

// Admin only routes (require authentication)
router.post('/', authenticateAdmin, newsController.createNews);
router.put('/:id', authenticateAdmin, newsController.updateNews);
router.delete('/:id', authenticateAdmin, newsController.deleteNews);
router.patch('/:id/toggle-status', authenticateAdmin, newsController.toggleStatus);
router.patch('/:id/toggle-ticker', authenticateAdmin, newsController.toggleTicker);
router.get('/admin/stats', authenticateAdmin, newsController.getStats);

module.exports = router;