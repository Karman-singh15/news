const cron = require('node-cron');
const rssFetcher = require('../services/rssFetcher');
const saveArticles = require('../services/saveArticles');

/**
 * Executes the entire news aggregation pipeline.
 * Fetches RSS feeds and persists them to the DB.
 */
const executePipeline = async () => {
    console.log('--- [CRON] Starting news aggregation job ---');
    try {
        const newArticles = await rssFetcher();
        console.log(`[CRON] Fetched ${newArticles.length} total articles.`);

        await saveArticles(newArticles);
    } catch (err) {
        console.error('[CRON Error] Pipeline failure:', err);
    } finally {
        console.log('--- [CRON] News aggregation job completed ---');
    }
};

/**
 * Configures the automated job schedule.
 */
const initFetchNewsJob = () => {
    // Run on startup immediately so that we have initialization data
    executePipeline();

    // Schedule to run every 30 minutes
    // Cron expression: */30 * * * *
    console.log('Scheduled fetchNewsJob to run every 30 minutes.');
    cron.schedule('*/30 * * * *', async () => {
        await executePipeline();
    });
};

module.exports = initFetchNewsJob;
