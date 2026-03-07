/**
 * List of RSS news sources categorized by political bias.
 * Extend this array to add more sources.
 */
const sources = [
    // LEFT
    {
        name: "New York Times",
        bias: "left",
        rss: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
    },
    {
        name: "The Guardian",
        bias: "left",
        rss: "https://www.theguardian.com/world/rss"
    },

    // CENTER
    {
        name: "BBC",
        bias: "center",
        rss: "http://feeds.bbci.co.uk/news/rss.xml"
    },
    {
        name: "Reuters",
        bias: "center",
        rss: "https://www.reutersagency.com/feed/?best-topics=political-general&post_type=best"
    },

    // RIGHT
    {
        name: "Fox News",
        bias: "right",
        rss: "https://moxie.foxnews.com/google-publisher/latest.xml"
    },
    {
        name: "New York Post",
        bias: "right",
        rss: "https://nypost.com/feed/"
    }
];

module.exports = sources;
