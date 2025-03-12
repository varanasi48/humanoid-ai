const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/gemini', async (req, res) => {
    try {
        const apiKey = 'AIzaSyDPRm8r31mhB6YIn9sl6bzaTW7E0podlE0'; // Replace with your actual Gemini API key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            console.error("API Error:", response.status, response.statusText);
            const errorText = await response.text();
            console.error("API Error Details:", errorText);
            return res.status(response.status).json({ error: response.statusText, details: errorText });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
