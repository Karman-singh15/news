const prisma = require('../db/prisma');

/**
 * Service to save an array of articles into the database.
 * Ignores duplicate articles based on checking their unique URL iteratively.
 * Prisma's try/catch approach handles primary key collision silently.
 * 
 * @param {Array} articles - Array of normalized article objects 
 */
const saveArticles = async (articles) => {
    if (!Array.isArray(articles) || articles.length === 0) return;

    let savedCount = 0;

    for (const article of articles) {
        try {
            // Use Prisma's create API, trapping the unique constraint error
            // It avoids fetching if it already exists, maintaining performance.
            await prisma.article.create({
                data: {
                    title: article.title,
                    content: article.content,
                    url: article.link,
                    source: article.source,
                    bias: article.bias,
                    publishedAt: article.publishedAt,
                }
            });
            savedCount++;
        } catch (error) {
            // Prisma Error Code P2002 indicates a unique constraint violation (duplicate article URL)
            if (error.code === 'P2002') {
                // Skip duplicate quietly
                continue;
            } else {
                // Log unexpected database saving issues
                console.error(`[DB Error] Failed to save article "${article.title}":`, error.message);
            }
        }
    }

    console.log(`Successfully saved ${savedCount} new articles.`);
};

module.exports = saveArticles;
