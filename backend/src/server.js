require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes and scheduled jobs
const newsRoutes = require('./api/news.routes');
const initFetchNewsJob = require('./jobs/fetchNewsJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Body parser
app.use(express.json());

// API Routes
app.use('/news', newsRoutes);

// General route
app.get('/', (req, res) => {
    res.send('News Aggregator API is running smoothly.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server environment running on http://localhost:${PORT}`);

    // Initialize the cron job to poll RSS feeds after server boot
    initFetchNewsJob();
});
