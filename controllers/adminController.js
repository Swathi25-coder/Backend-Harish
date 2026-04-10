const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

const adminController = {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Username and password required' 
                });
            }
            
            const admin = await AdminModel.verifyCredentials(username, password);
            
            if (!admin) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid credentials' 
                });
            }
            
            if (!admin.is_active) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Account is disabled. Please contact super admin.' 
                });
            }
            
            const token = jwt.sign(
                { id: admin.id, username: admin.username, role: admin.role },
                process.env.JWT_SECRET || 'your-secret-key-change-this',
                { expiresIn: '1d' }
            );
            
            res.json({
                success: true,
                token,
                message: 'Login successful',
                admin: { 
                    id: admin.id, 
                    username: admin.username,
                    email: admin.email,
                    role: admin.role 
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Login failed' 
            });
        }
    },

    async verifyToken(req, res) {
        try {
            const admin = await AdminModel.findById(req.admin.id);
            res.json({ 
                success: true,
                valid: true, 
                admin: admin 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Token verification failed' 
            });
        }
    },

    async getProfile(req, res) {
        try {
            const admin = await AdminModel.findById(req.admin.id);
            if (!admin) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Admin not found' 
                });
            }
            res.json({ 
                success: true,
                admin: admin 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Error fetching profile' 
            });
        }
    },

    async getAllAdmins(req, res) {
        try {
            // Only super admin can list all admins
            if (req.admin.role !== 'super_admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied. Super admin only.' 
                });
            }
            
            const admins = await AdminModel.getAllAdmins();
            res.json({ 
                success: true,
                admins: admins 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Error fetching admins' 
            });
        }
    },

    async createAdmin(req, res) {
        try {
            // Only super admin can create new admins
            if (req.admin.role !== 'super_admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied. Super admin only.' 
                });
            }
            
            const { username, password, email, role } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Username and password required' 
                });
            }
            
            // Check if admin already exists
            const existingAdmin = await AdminModel.findByUsername(username);
            if (existingAdmin) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Username already exists' 
                });
            }
            
            const admin = await AdminModel.createAdmin(username, password, email, role || 'admin');
            res.status(201).json({ 
                success: true,
                message: 'Admin created successfully',
                admin: admin 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Error creating admin' 
            });
        }
    },

    async updateAdmin(req, res) {
        try {
            // Only super admin can update admins
            if (req.admin.role !== 'super_admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied. Super admin only.' 
                });
            }
            
            const { id } = req.params;
            const updates = req.body;
            
            const admin = await AdminModel.updateAdmin(id, updates);
            if (!admin) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Admin not found' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Admin updated successfully',
                admin: admin 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Error updating admin' 
            });
        }
    },

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Current password and new password required' 
                });
            }
            
            // Verify current password
            const admin = await AdminModel.findByUsername(req.admin.username);
            const isValid = await bcrypt.compare(currentPassword, admin.password);
            
            if (!isValid) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Current password is incorrect' 
                });
            }
            
            await AdminModel.changePassword(req.admin.id, newPassword);
            
            res.json({ 
                success: true,
                message: 'Password changed successfully' 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Error changing password' 
            });
        }
    },

    async deleteAdmin(req, res) {
        try {
            // Only super admin can delete admins
            if (req.admin.role !== 'super_admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied. Super admin only.' 
                });
            }
            
            const { id } = req.params;
            
            // Prevent self-deletion
            if (parseInt(id) === req.admin.id) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Cannot delete your own account' 
                });
            }
            
            const admin = await AdminModel.deleteAdmin(id);
            if (!admin) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Admin not found' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Admin deleted successfully' 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Error deleting admin' 
            });
        }
    },

    async logout(req, res) {
        // For JWT, logout is handled client-side by removing the token
        res.json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    }
};

module.exports = adminController;