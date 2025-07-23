const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Parse JSON bodies
app.use(express.json());

// Serve the voice chat page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'voice-chat.html'));
});

// API endpoint for the bot - integrates with your resortHelper
app.post('/api/session', async (req, res) => {
    const { message, sessionId, timestamp } = req.body;
    
    try {
        // Make request to your main app's API endpoint
        const backendUrl = process.env.BACKEND_URL || 'https://openai-realtime-agents.fly.dev';
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${backendUrl}/api/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                sessionId,
                timestamp,
                agent: 'resortHelper'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json({ response: data.response || data.message || 'I received your message!' });
        
    } catch (error) {
        console.error('Error processing request:', error);
        
        // Fallback response
        const fallbackResponse = `I heard you say: "${message}". I'm here to help with your stay at Coconut Beach! Please try again in a moment, or contact staff directly if you need immediate assistance.`;
        res.json({ response: fallbackResponse });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
