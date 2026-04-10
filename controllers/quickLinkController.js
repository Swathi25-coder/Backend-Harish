const QuickLinkModel = require('../models/quickLinkModel');

const quickLinkController = {
    // Get all quick links (public - for frontend)
    async getAllLinks(req, res) {
        try {
            const { category } = req.query;
            const links = await QuickLinkModel.getAllLinks(category || null, true);
            
            // Group by category for easier frontend consumption
            const groupedLinks = {
                admit_cards: [],
                results: [],
                answer_keys: [],
                syllabus: [],
                important_links: []
            };
            
            links.forEach(link => {
                switch(link.category) {
                    case 'admit_card':
                        groupedLinks.admit_cards.push(link);
                        break;
                    case 'result':
                        groupedLinks.results.push(link);
                        break;
                    case 'answer_key':
                        groupedLinks.answer_keys.push(link);
                        break;
                    case 'syllabus':
                        groupedLinks.syllabus.push(link);
                        break;
                    case 'important_link':
                        groupedLinks.important_links.push(link);
                        break;
                    default:
                        groupedLinks.important_links.push(link);
                }
            });
            
            res.json({
                success: true,
                total: links.length,
                links: links,
                grouped: groupedLinks
            });
        } catch (error) {
            console.error('Error fetching quick links:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching quick links' 
            });
        }
    },

    // Get links by specific category (admin use)
    async getLinksByCategory(req, res) {
        try {
            const { category } = req.params;
            const links = await QuickLinkModel.getLinksByCategory(category);
            res.json({
                success: true,
                category: category,
                links: links
            });
        } catch (error) {
            console.error('Error fetching links by category:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching links' 
            });
        }
    },

    // Get single link by ID
    async getLinkById(req, res) {
        try {
            const link = await QuickLinkModel.getLinkById(req.params.id);
            if (!link) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Link not found' 
                });
            }
            res.json({
                success: true,
                link: link
            });
        } catch (error) {
            console.error('Error fetching link:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching link' 
            });
        }
    },

    // Create new quick link (admin only)
    async createLink(req, res) {
        try {
            const { name, icon, link, category, display_order, is_active } = req.body;
            
            // Validation
            if (!name || !link || !category) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Name, link, and category are required' 
                });
            }
            
            const newLink = await QuickLinkModel.createLink({
                name,
                icon,
                link,
                category,
                display_order,
                is_active
            });
            
            res.status(201).json({
                success: true,
                message: 'Quick link created successfully',
                link: newLink
            });
        } catch (error) {
            console.error('Error creating quick link:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error creating quick link' 
            });
        }
    },

    // Update quick link (admin only)
    async updateLink(req, res) {
        try {
            const id = parseInt(req.params.id);
            const existingLink = await QuickLinkModel.getLinkById(id);
            
            if (!existingLink) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Link not found' 
                });
            }
            
            const updatedLink = await QuickLinkModel.updateLink(id, req.body);
            res.json({
                success: true,
                message: 'Quick link updated successfully',
                link: updatedLink
            });
        } catch (error) {
            console.error('Error updating quick link:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error updating quick link' 
            });
        }
    },

    // Delete quick link (admin only)
    async deleteLink(req, res) {
        try {
            const id = parseInt(req.params.id);
            const existingLink = await QuickLinkModel.getLinkById(id);
            
            if (!existingLink) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Link not found' 
                });
            }
            
            await QuickLinkModel.deleteLink(id);
            res.json({
                success: true,
                message: 'Quick link deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting quick link:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error deleting quick link' 
            });
        }
    },

    // Update display order (admin only)
    async updateDisplayOrder(req, res) {
        try {
            const { updates } = req.body; // Array of {id, display_order}
            
            if (!updates || !Array.isArray(updates)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Updates array is required' 
                });
            }
            
            await QuickLinkModel.updateDisplayOrder(updates);
            res.json({
                success: true,
                message: 'Display order updated successfully'
            });
        } catch (error) {
            console.error('Error updating display order:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error updating display order' 
            });
        }
    },

    // Get all categories (admin only)
    async getAllCategories(req, res) {
        try {
            const categories = await QuickLinkModel.getAllCategories();
            res.json({
                success: true,
                categories: categories
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching categories' 
            });
        }
    }
};

module.exports = quickLinkController;