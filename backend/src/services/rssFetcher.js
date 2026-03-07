const Parser = require('rss-parser');
const sources = require('../data/sources');

// Initialize rss-parser
const parser = new Parser({
    customFields: {
        item: ['content:encoded', 'description', 'pubDate'],
    }
});

/**
 * Service to fetch articles from all defined RSS feeds.
 * It maps the raw RSS feed items into normalized Article objects.
 * 
 * @returns {Promise<Array>} Array of parsed articles.
 */
const rssFetcher = async () => {
    const allArticles = [];

    for (const source of sources) {
        try {
            console.log(`Fetching RSS feed from: ${source.name}`);
            const feed = await parser.parseURL(source.rss);

            feed.items.forEach(item => {
                // Fallbacks for content depending on the feed's structure
                const content = item['content:encoded'] || item.content || item.description || '';

                // Normalize the published date
                const pubDateObj = item.pubDate ? new Date(item.pubDate) : new Date();
                const publishedAt = isNaN(pubDateObj.getTime()) ? new Date() : pubDateObj;

                // Skip entries missing essential data
                if (!item.link || !item.title) return;

                allArticles.push({
                    title: item.title,
                    content: content,
                    link: item.link,
                    publishedAt: publishedAt,
                    source: source.name,
                    bias: source.bias,
                });
            });

        } catch (error) {
            // Gracefully handle feed fetch errors so we don't crash the server
            console.error(`[Error] Failed to fetch feed for ${source.name}:`, error.message);
        }
    }

    return allArticles;
};

module.exports = rssFetcher;
