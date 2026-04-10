const pool = require('../config/database');

class JobModel {
    static async getAllCategories() {
        const result = await pool.query(
            `SELECT id, name, slug, icon, description, display_order, is_active 
             FROM public.categories 
             WHERE is_active = true 
             ORDER BY display_order`
        );
        return result.rows;
    }

    static async getCategoryById(id) {
        const result = await pool.query(
            `SELECT id, name, slug, icon, description, display_order, is_active 
             FROM public.categories 
             WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async getCategoryBySlug(slug) {
        const result = await pool.query(
            `SELECT id, name, slug, icon, description, display_order, is_active 
             FROM public.categories 
             WHERE slug = $1`,
            [slug]
        );
        return result.rows[0];
    }

    static async getAllJobs(search = null, department = null, categorySlug = null) {
        let query = `SELECT 
                        j.id, 
                        j.title, 
                        j.department, 
                        j.description, 
                        j.eligibility, 
                        j.last_date,
                        j.job_link,
                        j.total_posts,
                        j.created_at,
                        j.updated_at,
                        j.category_id,
                        c.name as category_name,
                        c.slug as category_slug,
                        c.icon as category_icon,
                        CASE 
                            WHEN j.last_date > CURRENT_DATE THEN 'active'
                            ELSE 'expired'
                        END as status,
                        CASE 
                            WHEN j.created_at > CURRENT_DATE - INTERVAL '7 days' THEN true
                            ELSE false
                        END as is_new
                     FROM public.jobs j
                     LEFT JOIN public.categories c ON j.category_id = c.id
                     WHERE 1=1`;
        let params = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (j.title ILIKE $${paramCount} OR j.department ILIKE $${paramCount} OR j.eligibility ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (department) {
            query += ` AND j.department = $${paramCount}`;
            params.push(department);
            paramCount++;
        }

        if (categorySlug && categorySlug !== 'all') {
            query += ` AND c.slug = $${paramCount}`;
            params.push(categorySlug);
            paramCount++;
        }

        query += ` ORDER BY j.created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async getJobsByCategory(categorySlug) {
        return await this.getAllJobs(null, null, categorySlug);
    }

    static async getJobById(id) {
        const result = await pool.query(
            `SELECT 
                j.id, 
                j.title, 
                j.department, 
                j.description, 
                j.eligibility, 
                j.last_date,
                j.job_link,
                j.total_posts,
                j.created_at,
                j.updated_at,
                j.application_fee_general,
                j.application_fee_obc,
                j.application_fee_scst,
                j.age_limit,
                j.vacancy_details,
                j.selection_process,
                j.important_dates,
                j.how_to_apply,
                j.official_website,
                j.notification_pdf,
                j.admit_card_link,
                j.result_link,
                j.syllabus_link,
                j.category_id,
                c.name as category_name,
                c.slug as category_slug,
                c.icon as category_icon,
                CASE 
                    WHEN j.last_date > CURRENT_DATE THEN 'active'
                    ELSE 'expired'
                END as status,
                CASE 
                    WHEN j.created_at > CURRENT_DATE - INTERVAL '7 days' THEN true
                    ELSE false
                END as is_new
             FROM public.jobs j
             LEFT JOIN public.categories c ON j.category_id = c.id
             WHERE j.id = $1`,
            [id]
        );

        if (result.rows[0]) {
            const job = result.rows[0];
            if (job.important_dates) {
                try {
                    job.important_dates = JSON.parse(job.important_dates);
                } catch(e) {}
            }
            if (job.selection_process) {
                try {
                    job.selection_process = JSON.parse(job.selection_process);
                } catch(e) {}
            }
            if (job.vacancy_details) {
                try {
                    job.vacancy_details = JSON.parse(job.vacancy_details);
                } catch(e) {}
            }
            return job;
        }
        return null;
    }

    static async createJob(jobData) {
        const { 
            title, 
            department, 
            description, 
            eligibility, 
            lastDate, 
            jobLink,
            total_posts,
            application_fee_general,
            application_fee_obc,
            application_fee_scst,
            age_limit,
            vacancy_details,
            selection_process,
            important_dates,
            how_to_apply,
            official_website,
            notification_pdf,
            admit_card_link,
            result_link,
            syllabus_link,
            category_id
        } = jobData;

        const result = await pool.query(
            `INSERT INTO public.jobs (
                title, department, description, eligibility, last_date, job_link,
                total_posts, application_fee_general, application_fee_obc, application_fee_scst,
                age_limit, vacancy_details, selection_process, important_dates, how_to_apply,
                official_website, notification_pdf, admit_card_link, result_link, syllabus_link,
                category_id, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *`,
            [
                title, department, description, eligibility, lastDate, jobLink,
                total_posts || null,
                application_fee_general || null,
                application_fee_obc || null,
                application_fee_scst || null,
                age_limit || null,
                vacancy_details ? JSON.stringify(vacancy_details) : null,
                selection_process ? JSON.stringify(selection_process) : null,
                important_dates ? JSON.stringify(important_dates) : null,
                how_to_apply || null,
                official_website || null,
                notification_pdf || null,
                admit_card_link || null,
                result_link || null,
                syllabus_link || null,
                category_id || 1
            ]
        );
        return result.rows[0];
    }

    static async updateJob(id, jobData) {
        const { 
            title, department, description, eligibility, lastDate, jobLink,
            total_posts, application_fee_general, application_fee_obc, application_fee_scst,
            age_limit, vacancy_details, selection_process, important_dates, how_to_apply,
            official_website, notification_pdf, admit_card_link, result_link, syllabus_link,
            category_id
        } = jobData;

        const result = await pool.query(
            `UPDATE public.jobs 
             SET title = $1, 
                 department = $2, 
                 description = $3, 
                 eligibility = $4, 
                 last_date = $5, 
                 job_link = $6,
                 total_posts = $7,
                 application_fee_general = $8,
                 application_fee_obc = $9,
                 application_fee_scst = $10,
                 age_limit = $11,
                 vacancy_details = $12,
                 selection_process = $13,
                 important_dates = $14,
                 how_to_apply = $15,
                 official_website = $16,
                 notification_pdf = $17,
                 admit_card_link = $18,
                 result_link = $19,
                 syllabus_link = $20,
                 category_id = $21,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $22 
             RETURNING *`,
            [
                title, department, description, eligibility, lastDate, jobLink,
                total_posts || null,
                application_fee_general || null,
                application_fee_obc || null,
                application_fee_scst || null,
                age_limit || null,
                vacancy_details ? JSON.stringify(vacancy_details) : null,
                selection_process ? JSON.stringify(selection_process) : null,
                important_dates ? JSON.stringify(important_dates) : null,
                how_to_apply || null,
                official_website || null,
                notification_pdf || null,
                admit_card_link || null,
                result_link || null,
                syllabus_link || null,
                category_id || 1,
                id
            ]
        );
        return result.rows[0];
    }

    static async deleteJob(id) {
        const result = await pool.query('DELETE FROM public.jobs WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    }

    static async getAllDepartments() {
        const result = await pool.query(
            `SELECT DISTINCT department FROM public.jobs ORDER BY department`
        );
        return result.rows.map(row => row.department);
    }

    static async getCategoryCounts() {
        const result = await pool.query(
            `SELECT 
                c.id,
                c.name,
                c.slug,
                c.icon,
                COUNT(j.id) as job_count
             FROM public.categories c
             LEFT JOIN public.jobs j ON j.category_id = c.id AND j.last_date > CURRENT_DATE
             WHERE c.is_active = true
             GROUP BY c.id, c.name, c.slug, c.icon, c.display_order
             ORDER BY c.display_order`
        );
        
        const counts = {};
        const categoriesList = [];
        
        result.rows.forEach(row => {
            counts[row.slug] = parseInt(row.job_count);
            categoriesList.push({
                id: row.id,
                name: row.name,
                slug: row.slug,
                icon: row.icon,
                count: parseInt(row.job_count)
            });
        });
        
        return { counts, categoriesList };
    }

    static async getCategoryCountsForAllJobs() {
        const result = await pool.query(
            `SELECT 
                c.id,
                c.name,
                c.slug,
                c.icon,
                COUNT(j.id) as job_count
             FROM public.categories c
             LEFT JOIN public.jobs j ON j.category_id = c.id
             WHERE c.is_active = true
             GROUP BY c.id, c.name, c.slug, c.icon, c.display_order
             ORDER BY c.display_order`
        );
        
        const categoriesWithCounts = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            icon: row.icon,
            count: parseInt(row.job_count)
        }));
        
        return categoriesWithCounts;
    }
}

module.exports = JobModel;