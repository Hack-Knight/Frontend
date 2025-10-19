// filepath: /Users/din/Documents/Frontend/api/ai.js

module.exports = async (req, res) => {
  res.statusCode = 410; // Gone
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Removed: This endpoint is no longer in use.' }));
};
