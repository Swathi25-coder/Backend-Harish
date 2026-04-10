const JobModel = require('../models/jobModel');

const jobController = {
    async getAllJobs(req, res) {
        try {
            const { search, department, category } = req.query;
            const jobs = await JobModel.getAllJobs(search, department, category);
            
            // Get categories with counts for active jobs
            const categoryData = await JobModel.getCategoryCounts();
            
            res.json({
                success: true,
                total: jobs.length,
                jobs: jobs,
                categoryCounts: categoryData.counts,
                categories: categoryData.categoriesList
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching jobs' });
        }
    },

    async getAllCategories(req, res) {
        try {
            const categories = await JobModel.getAllCategories();
            const categoryCounts = await JobModel.getCategoryCountsForAllJobs();
            
            res.json({
                success: true,
                categories: categories,
                categoriesWithCounts: categoryCounts
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching categories' });
        }
    },

    async getJobsByCategory(req, res) {
        try {
            const { slug } = req.params;
            const jobs = await JobModel.getJobsByCategory(slug);
            
            res.json({
                success: true,
                category: slug,
                total: jobs.length,
                jobs: jobs
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching jobs by category' });
        }
    },

    async getJobById(req, res) {
        try {
            const job = await JobModel.getJobById(req.params.id);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }
            res.json({
                success: true,
                job: job
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching job' });
        }
    },

    async getDepartments(req, res) {
        try {
            const departments = await JobModel.getAllDepartments();
            res.json({
                success: true,
                departments: departments
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching departments' });
        }
    },

    async getCategoryCounts(req, res) {
        try {
            const categoryData = await JobModel.getCategoryCounts();
            res.json({
                success: true,
                counts: categoryData.counts,
                categories: categoryData.categoriesList
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching category counts' });
        }
    },

    async createJob(req, res) {
        try {
            const job = await JobModel.createJob(req.body);
            res.status(201).json({
                success: true,
                message: 'Job created successfully',
                job: job
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating job' });
        }
    },

    async updateJob(req, res) {
        try {
            const job = await JobModel.updateJob(req.params.id, req.body);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }
            res.json({
                success: true,
                message: 'Job updated successfully',
                job: job
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating job' });
        }
    },

    async deleteJob(req, res) {
        try {
            const job = await JobModel.deleteJob(req.params.id);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }
            res.json({
                success: true,
                message: 'Job deleted successfully'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting job' });
        }
    }
};

module.exports = jobController;