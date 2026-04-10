const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
        
        // Check if admin still exists and is active
        const admin = await AdminModel.findById(decoded.id);
        if (!admin || !admin.is_active) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token. Admin not found or inactive.' 
            });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        console.error(error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Authentication failed.' 
        });
    }
};

module.exports = authenticateAdmin;