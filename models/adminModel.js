const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminModel {
    static async findByUsername(username) {
        const result = await pool.query('SELECT * FROM admin.admins WHERE username = $1', [username]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at, last_login, is_active FROM admin.admins WHERE id = $1', 
            [id]
        );
        return result.rows[0];
    }

    static async createDefaultAdmin() {
        try {
            await pool.query(`CREATE SCHEMA IF NOT EXISTS admin;`);
            
            await pool.query(`
                CREATE TABLE IF NOT EXISTS admin.admins (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    is_active BOOLEAN DEFAULT true
                )
            `);
            
            const existingAdmin = await this.findByUsername('admin');
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await pool.query(
                    `INSERT INTO admin.admins (username, password, email, role, is_active) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    ['admin', hashedPassword, 'admin@jobportal.com', 'super_admin', true]
                );
                console.log('✅ Default admin created in admin schema');
                console.log('   Username: admin');
                console.log('   Password: admin123');
            } else {
                console.log('✅ Admin already exists in admin schema');
            }
        } catch (error) {
            console.error('Error creating default admin:', error.message);
        }
    }

    static async verifyCredentials(username, password) {
        const admin = await this.findByUsername(username);
        if (!admin) return null;
        
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return null;
        
        await pool.query(
            'UPDATE admin.admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [admin.id]
        );
        
        return admin;
    }

    static async updateLastLogin(id) {
        await pool.query(
            'UPDATE admin.admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
    }

    static async getAllAdmins() {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at, last_login, is_active FROM admin.admins ORDER BY created_at DESC'
        );
        return result.rows;
    }

    static async createAdmin(username, password, email, role = 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO admin.admins (username, password, email, role, is_active) 
             VALUES ($1, $2, $3, $4, true) 
             RETURNING id, username, email, role, created_at`,
            [username, hashedPassword, email, role]
        );
        return result.rows[0];
    }

    static async updateAdmin(id, updates) {
        const { email, role, is_active } = updates;
        const result = await pool.query(
            `UPDATE admin.admins 
             SET email = COALESCE($1, email),
                 role = COALESCE($2, role),
                 is_active = COALESCE($3, is_active)
             WHERE id = $4 
             RETURNING id, username, email, role, is_active`,
            [email, role, is_active, id]
        );
        return result.rows[0];
    }

    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            `UPDATE admin.admins SET password = $1 WHERE id = $2 RETURNING id`,
            [hashedPassword, id]
        );
        return result.rows[0];
    }

    static async deleteAdmin(id) {
        const result = await pool.query(
            'DELETE FROM admin.admins WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = AdminModel;