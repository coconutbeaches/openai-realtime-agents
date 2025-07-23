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

// API endpoint for the bot (you'll need to implement this)
app.post('/api/session', async (req, res) => {
    const { message, sessionId, timestamp } = req.body;
    
    try {
        // TODO: Replace this with your actual bot API call
        // For now, just echo back a response
        const response = `I heard you say: "${message}". How can I help you with your stay at our resort?`;
        
        res.json({ response });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Sorry, I encountered an error. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
