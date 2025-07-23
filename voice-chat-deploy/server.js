const express = require('express');
const path = require('path');
const faqs = require('./data/flat_faqs.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Parse JSON bodies
app.use(express.json());

// Serve the OpenAI Agents Realtime SDK from node_modules
app.use('/lib', express.static(path.join(__dirname, 'node_modules/@openai/agents-realtime/dist')));

// Create FAQ context for agent instructions
function createAgentInstructions() {
  const faqContext = faqs.map(faq => 
    `Q: ${faq.question}\nA: ${faq.answer}`
  ).join('\n\n');
  
  return `You are a helpful resort assistant at Coconut Beach Resort in Koh Phangan, Thailand. You help English-speaking guests with questions about amenities and services.

IMPORTANT LANGUAGE REQUIREMENT: You must ALWAYS respond in English only. Never respond in Spanish, Thai, or any other language, regardless of what language the guest speaks to you in. All your responses must be in clear, conversational English.

You have access to this FAQ information:
${faqContext}

Respond in a friendly, helpful tone as if you're speaking directly to the guest. Keep responses concise but complete. If a guest asks about something not covered in the FAQs, provide general helpful resort assistance. Remember to always respond in English.`;
}

// Serve the voice chat page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'voice-chat.html'));
});

// API endpoint for creating session tokens
app.post('/api/session', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2025-06-03',
                voice: 'alloy'
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error response:', response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Session created successfully:', data.id);
        res.json(data);
    } catch (error) {
        console.error('Error creating session:', error.message);
        res.status(500).json({ error: 'Failed to create session', details: error.message });
    }
});

// API endpoint for getting agent instructions
app.get('/api/instructions', (req, res) => {
    res.json({ instructions: createAgentInstructions() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
