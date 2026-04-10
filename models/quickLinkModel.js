const pool = require('../config/database');

class QuickLinkModel {
    // Get all quick links (filtered by category if provided)
    static async getAllLinks(category = null, activeOnly = true) {
        let query = `
            SELECT 
                id,
                name,
                icon,
                link,
                category,
                display_order,
                is_active,
                created_at,
                updated_at
            FROM public.quick_links
            WHERE 1=1
        `;
        let params = [];
        let paramCount = 1;

        if (activeOnly) {
            query += ` AND is_active = true`;
        }

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        query += ` ORDER BY display_order ASC, created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    // Get links by specific category (admit_card, result, answer_key, syllabus, important_link)
    static async getLinksByCategory(category) {
        return await this.getAllLinks(category, true);
    }

    // Get single link by ID
    static async getLinkById(id) {
        const result = await pool.query(
            `SELECT 
                id, name, icon, link, category, display_order, is_active, created_at, updated_at
             FROM public.quick_links
             WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Create new quick link
    static async createLink(linkData) {
        const { name, icon, link, category, display_order, is_active } = linkData;

        const result = await pool.query(
            `INSERT INTO public.quick_links (name, icon, link, category, display_order, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
            [
                name,
                icon || '🔗',
                link,
                category,
                display_order || 0,
                is_active !== undefined ? is_active : true
            ]
        );
        return result.rows[0];
    }

    // Update quick link
    static async updateLink(id, linkData) {
        const { name, icon, link, category, display_order, is_active } = linkData;

        const result = await pool.query(
            `UPDATE public.quick_links
             SET name = COALESCE($1, name),
                 icon = COALESCE($2, icon),
                 link = COALESCE($3, link),
                 category = COALESCE($4, category),
                 display_order = COALESCE($5, display_order),
                 is_active = COALESCE($6, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [name, icon, link, category, display_order, is_active, id]
        );
        return result.rows[0];
    }

    // Delete quick link
    static async deleteLink(id) {
        const result = await pool.query(
            'DELETE FROM public.quick_links WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Get all distinct categories
    static async getAllCategories() {
        const result = await pool.query(
            `SELECT DISTINCT category FROM public.quick_links ORDER BY category`
        );
        return result.rows.map(row => row.category);
    }

    // Update display order for multiple links
    static async updateDisplayOrder(updates) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const item of updates) {
                await client.query(
                    'UPDATE public.quick_links SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [item.display_order, item.id]
                );
            }
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = QuickLinkModel;