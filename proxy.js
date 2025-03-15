const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase the limit for large payloads

app.post('/api/gemini', async (req, res) => {
    try {
        const apiKey = 'YOUR_GEMINI_API_KEY'; // Replace with your actual Gemini API key
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

app.post('/api/upload', async (req, res) => {
    try {
        const { accessToken, metadata, videoBlob } = req.body;

        // Step 1: Initiate the resumable upload session
        const initResponse = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "X-Upload-Content-Type": "video/mp4"
            },
            body: JSON.stringify(metadata)
        });

        if (!initResponse.ok) {
            console.error("YouTube Upload Init Error:", initResponse.status, initResponse.statusText);
            const errorText = await initResponse.text();
            console.error("YouTube Upload Init Error Details:", errorText);
            return res.status(initResponse.status).json({ error: initResponse.statusText, details: errorText });
        }

        const uploadUrl = initResponse.headers.get('location');
        if (!uploadUrl) {
            console.error("Failed to get upload URL from YouTube");
            return res.status(500).json({ error: 'Failed to get upload URL from YouTube' });
        }

        // Step 2: Upload the video file to the resumable session URL
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "video/mp4"
            },
            body: Buffer.from(videoBlob, 'base64')
        });

        if (!uploadResponse.ok) {
            console.error("YouTube Upload Error:", uploadResponse.status, uploadResponse.statusText);
            const errorText = await uploadResponse.text();
            console.error("YouTube Upload Error Details:", errorText);
            return res.status(uploadResponse.status).json({ error: uploadResponse.statusText, details: errorText });
        }

        const data = await uploadResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
