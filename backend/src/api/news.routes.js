const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

/**
 * GET /news
 * Retrieves the latest 50 articles from the database, sorted descending by publication date.
 */
router.get('/', async (req, res) => {
    try {
        const articles = await prisma.article.findMany({
            take: 50,
            orderBy: {
                publishedAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            data: articles,
        });
    } catch (error) {
        console.error('[API Error] Failed to fetch news articles:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving articles'
        });
    }
});

module.exports = router;
