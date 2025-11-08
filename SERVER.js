// Import required modules
const express = require('express'); // Web server framework
const fetch = require('node-fetch'); // For making HTTP requests
const app = express(); // Create an Express app

// Serve static files (HTML, CSS, JS) from the current folder
app.use(express.static('.'));

// Endpoint to get NHL news for a specific team
app.get('/NEWS', async (req, res) => {
  try {
    const teamId = 26; // Team ID (26 = Los Angeles Kings)
    const url = `https://statsapi.web.nhl.com/api/v1/teams/${teamId}/news`; // NHL API endpoint

    // Fetch news data from NHL API
    const response = await fetch(url);

    // Convert the response to JSON format
    const data = await response.json();

    // Send the news data back to the browser
    res.json(data);

  } catch (err) {
    // If something goes wrong, send an error message
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Start the server on port 3000
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
