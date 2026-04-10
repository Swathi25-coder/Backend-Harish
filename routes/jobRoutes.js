const express = require('express');
const jobController = require('../controllers/jobController');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();


router.get('/departments', jobController.getDepartments);
router.get('/categories', jobController.getAllCategories);
router.get('/categories/counts', jobController.getCategoryCounts);
router.get('/category/:slug', jobController.getJobsByCategory);
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);


router.post('/', authenticateAdmin, jobController.createJob);
router.put('/:id', authenticateAdmin, jobController.updateJob);
router.delete('/:id', authenticateAdmin, jobController.deleteJob);

module.exports = router;