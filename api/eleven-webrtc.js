// filepath: /Users/din/Documents/Frontend/api/eleven-webrtc.js

// POST /api/eleven-webrtc
// Body: { sdp: string, type?: 'offer' }
// Response: { sdp: string, type: 'answer' } on success
// Env required: ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID
// Optional: ELEVENLABS_WEBRTC_URL (if not set, will be derived as
//   https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}/webrtc)

module.exports = async (req, res) => {
  res.statusCode = 410; // Gone
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Removed: Client now connects directly via @elevenlabs/react.' }));
};