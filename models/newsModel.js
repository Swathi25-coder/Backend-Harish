const pool = require('../config/database');

class NewsModel {
    // Get all news items
    static async getAllNews(onlyTicker = false, activeOnly = true, limit = null) {
        let query = `
            SELECT 
                id,
                title,
                content,
                news_date,
                is_ticker,
                priority,
                is_active,
                link,
                created_at,
                updated_at,
                CASE
                    WHEN news_date > CURRENT_DATE THEN 'upcoming'
                    WHEN news_date = CURRENT_DATE THEN 'today'
                    ELSE 'past'
                END as date_status
            FROM public.news
            WHERE 1=1
        `;
        let params = [];
        let paramCount = 1;

        if (activeOnly) {
            query += ` AND is_active = true`;
        }

        if (onlyTicker) {
            query += ` AND is_ticker = true`;
        }

        query += ` ORDER BY priority ASC, news_date DESC, created_at DESC`;

        if (limit) {
            query += ` LIMIT $${paramCount}`;
            params.push(limit);
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    // Get news for ticker (only active, ticker-enabled, limited)
    static async getTickerNews(limit = 10) {
        return await this.getAllNews(true, true, limit);
    }

    // Get latest news (for news page)
    static async getLatestNews(limit = 20) {
        return await this.getAllNews(false, true, limit);
    }

    // Get single news by ID
    static async getNewsById(id) {
        const result = await pool.query(
            `SELECT 
                id, title, content, news_date, is_ticker, priority, is_active, link, created_at, updated_at
             FROM public.news
             WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Create new news
    static async createNews(newsData) {
        const { title, content, news_date, is_ticker, priority, is_active, link } = newsData;

        const result = await pool.query(
            `INSERT INTO public.news (title, content, news_date, is_ticker, priority, is_active, link, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
            [
                title,
                content || null,
                news_date || new Date(),
                is_ticker !== undefined ? is_ticker : true,
                priority || 0,
                is_active !== undefined ? is_active : true,
                link || null
            ]
        );
        return result.rows[0];
    }

    // Update news
    static async updateNews(id, newsData) {
        const { title, content, news_date, is_ticker, priority, is_active, link } = newsData;

        const result = await pool.query(
            `UPDATE public.news
             SET title = COALESCE($1, title),
                 content = COALESCE($2, content),
                 news_date = COALESCE($3, news_date),
                 is_ticker = COALESCE($4, is_ticker),
                 priority = COALESCE($5, priority),
                 is_active = COALESCE($6, is_active),
                 link = COALESCE($7, link),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING *`,
            [title, content, news_date, is_ticker, priority, is_active, link, id]
        );
        return result.rows[0];
    }

    // Delete news
    static async deleteNews(id) {
        const result = await pool.query(
            'DELETE FROM public.news WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // Toggle news status (active/inactive)
    static async toggleStatus(id, is_active) {
        const result = await pool.query(
            `UPDATE public.news 
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [is_active, id]
        );
        return result.rows[0];
    }

    // Toggle ticker status
    static async toggleTicker(id, is_ticker) {
        const result = await pool.query(
            `UPDATE public.news 
             SET is_ticker = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [is_ticker, id]
        );
        return result.rows[0];
    }

    // Get news count by status
    static async getStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active,
                COUNT(CASE WHEN is_ticker = true AND is_active = true THEN 1 END) as ticker_active,
                COUNT(CASE WHEN news_date = CURRENT_DATE THEN 1 END) as today_news
            FROM public.news
        `);
        return result.rows[0];
    }
}

module.exports = NewsModel;