import fetch from 'node-fetch';

export const handler = async (event) => {
    const { path, httpMethod, headers, body } = event;

    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: '',
        };
    }

    if (path === '/api/gemini' && httpMethod === 'POST') {
        return await handleGeminiRequest(body);
    } else if (path === '/api/upload' && httpMethod === 'POST') {
        return await handleUploadRequest(body);
    } else if (path === '/api/youtube' && httpMethod === 'POST') {
        return await handleYouTubeUploadRequest(body);
    } else {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Not Found' }),
        };
    }
};

async function handleGeminiRequest(body) {
    try {
        const apiKey = 'YOUR_GEMINI_API_KEY'; // Replace with your actual Gemini API key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                statusCode: response.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: response.statusText, details: errorText }),
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
}

async function handleUploadRequest(body) {
    try {
        const { accessToken, metadata, videoBlob } = JSON.parse(body);

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
            const errorText = await initResponse.text();
            return {
                statusCode: initResponse.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: initResponse.statusText, details: errorText }),
            };
        }

        const uploadUrl = initResponse.headers.get('location');
        if (!uploadUrl) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Failed to get upload URL from YouTube' }),
            };
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
            const errorText = await uploadResponse.text();
            return {
                statusCode: uploadResponse.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: uploadResponse.statusText, details: errorText }),
            };
        }

        const data = await uploadResponse.json();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
}

async function handleYouTubeUploadRequest(body) {
    try {
        const { accessToken, metadata, videoBlob } = JSON.parse(body);

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
            const errorText = await initResponse.text();
            return {
                statusCode: initResponse.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: initResponse.statusText, details: errorText }),
            };
        }

        const uploadUrl = initResponse.headers.get('location');
        if (!uploadUrl) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Failed to get upload URL from YouTube' }),
            };
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
            const errorText = await uploadResponse.text();
            return {
                statusCode: uploadResponse.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: uploadResponse.statusText, details: errorText }),
            };
        }

        const data = await uploadResponse.json();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
}
