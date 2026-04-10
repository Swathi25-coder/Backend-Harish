const NewsModel = require('../models/newsModel');

const newsController = {
    // Get all news (public - for frontend)
    async getAllNews(req, res) {
        try {
            const { ticker_only, limit } = req.query;
            
            let news;
            if (ticker_only === 'true') {
                news = await NewsModel.getTickerNews(limit ? parseInt(limit) : 10);
            } else {
                news = await NewsModel.getLatestNews(limit ? parseInt(limit) : 20);
            }
            
            res.json({
                success: true,
                total: news.length,
                news: news
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching news' 
            });
        }
    },

    // Get ticker news only (for homepage ticker)
    async getTickerNews(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const news = await NewsModel.getTickerNews(limit);
            
            res.json({
                success: true,
                total: news.length,
                news: news
            });
        } catch (error) {
            console.error('Error fetching ticker news:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching ticker news' 
            });
        }
    },

    // Get single news by ID
    async getNewsById(req, res) {
        try {
            const news = await NewsModel.getNewsById(req.params.id);
            if (!news) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'News not found' 
                });
            }
            res.json({
                success: true,
                news: news
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching news' 
            });
        }
    },

    // Create new news (admin only)
    async createNews(req, res) {
        try {
            const { title, content, news_date, is_ticker, priority, is_active, link } = req.body;
            
            // Validation
            if (!title) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Title is required' 
                });
            }
            
            const newNews = await NewsModel.createNews({
                title,
                content,
                news_date,
                is_ticker,
                priority,
                is_active,
                link
            });
            
            res.status(201).json({
                success: true,
                message: 'News created successfully',
                news: newNews
            });
        } catch (error) {
            console.error('Error creating news:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error creating news' 
            });
        }
    },

    // Update news (admin only)
    async updateNews(req, res) {
        try {
            const id = parseInt(req.params.id);
            const existingNews = await NewsModel.getNewsById(id);
            
            if (!existingNews) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'News not found' 
                });
            }
            
            const updatedNews = await NewsModel.updateNews(id, req.body);
            res.json({
                success: true,
                message: 'News updated successfully',
                news: updatedNews
            });
        } catch (error) {
            console.error('Error updating news:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error updating news' 
            });
        }
    },

    // Delete news (admin only)
    async deleteNews(req, res) {
        try {
            const id = parseInt(req.params.id);
            const existingNews = await NewsModel.getNewsById(id);
            
            if (!existingNews) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'News not found' 
                });
            }
            
            await NewsModel.deleteNews(id);
            res.json({
                success: true,
                message: 'News deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting news:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error deleting news' 
            });
        }
    },

    // Toggle news status (admin only)
    async toggleStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { is_active } = req.body;
            
            if (is_active === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'is_active status is required' 
                });
            }
            
            const updatedNews = await NewsModel.toggleStatus(id, is_active);
            if (!updatedNews) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'News not found' 
                });
            }
            
            res.json({
                success: true,
                message: `News ${is_active ? 'activated' : 'deactivated'} successfully`,
                news: updatedNews
            });
        } catch (error) {
            console.error('Error toggling news status:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error toggling news status' 
            });
        }
    },

    // Toggle ticker status (admin only)
    async toggleTicker(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { is_ticker } = req.body;
            
            if (is_ticker === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'is_ticker status is required' 
                });
            }
            
            const updatedNews = await NewsModel.toggleTicker(id, is_ticker);
            if (!updatedNews) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'News not found' 
                });
            }
            
            res.json({
                success: true,
                message: `News ticker ${is_ticker ? 'enabled' : 'disabled'} successfully`,
                news: updatedNews
            });
        } catch (error) {
            console.error('Error toggling ticker status:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error toggling ticker status' 
            });
        }
    },

    // Get news statistics (admin only)
    async getStats(req, res) {
        try {
            const stats = await NewsModel.getStats();
            res.json({
                success: true,
                stats: stats
            });
        } catch (error) {
            console.error('Error fetching news stats:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching statistics' 
            });
        }
    }
};

module.exports = newsController;