const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.static('.')); // serves HTML/CSS/JS from current folder

app.get('/NEWS', async (req, res) => {
  try {
    const teamId = 26; // LA Kings
    const url = `https://statsapi.web.nhl.com/api/v1/teams/${teamId}/news`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data); // send news to client
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
