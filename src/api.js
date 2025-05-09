/**
 * API handling for Idiotagrama Patcher
 */

// Default configuration
const STYLE_EXPERT = "ILLUSTRATION"; // Options: "DEFAULT", "RENDER_3D", "ILLUSTRATION", "PHOTO", etc.

// Function to get basic headers with auth
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Referer': 'https://ideogram.ai/t/explore',
        'Origin': 'https://ideogram.ai'
    };
    
    // Get the authentication from the window object
    const { bearerToken } = window.authState || {};
    
    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }
    
    return headers;
}

// Function to fetch data from the API
function fetchApi(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: getHeaders(),
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    const data = JSON.parse(response.responseText);
                    resolve(data);
                } else {
                    reject(`Error fetching API data: ${response.statusText}`);
                }
            },
            onerror: function(error) {
                reject(`Error fetching API data: ${error}`);
            }
        });
    });
}

// Function to POST to API endpoints
function postApi(url, payload) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'POST',
            url: url,
            headers: getHeaders(),
            data: JSON.stringify(payload),
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const data = JSON.parse(response.responseText);
                        resolve(data);
                    } catch (e) {
                        resolve(response.responseText);
                    }
                } else {
                    reject(`Error in API request: ${response.statusText}`);
                }
            },
            onerror: function(error) {
                reject(`Error in API request: ${error}`);
            }
        });
    });
}

// Function to DELETE from API endpoints
function deleteApi(url, payload) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'DELETE',
            url: url,
            headers: getHeaders(),
            data: JSON.stringify(payload),
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const data = JSON.parse(response.responseText);
                        resolve(data);
                    } catch (e) {
                        resolve(response.responseText);
                    }
                } else {
                    reject(`Error in DELETE request: ${response.statusText}`);
                }
            },
            onerror: function(error) {
                reject(`Error in DELETE request: ${error}`);
            }
        });
    });
}

// Function to submit an event
function submitEvent(eventKey, metadata) {
    const eventUrl = 'https://ideogram.ai/api/e/submit';
    const { userId, userHandle } = window.authState || {};
    
    const payload = {
        event_key: eventKey,
        metadata: JSON.stringify({
            path: "/t/explore",
            triggeredUtcTime: Date.now(),
            userAgent: navigator.userAgent,
            isMobileLayout: false,
            userHandle: userHandle || "",
            userId: userId || "",
            location: Intl.DateTimeFormat().resolvedOptions().timeZone,
            generationInProgress: false,
            ...metadata
        })
    };
    
    return postApi(eventUrl, payload);
}

// Function to download image with a timeout and retries
async function downloadImageWithTimeout(imageUrl, responseId, maxRetries = 2) {
    const timeout = 5000; // 5 seconds timeout
    let attempts = 0;
    const { bearerToken } = window.authState || {};

    while (attempts <= maxRetries) {
        try {
            return await new Promise((resolve, reject) => {
                let timeoutHandle = setTimeout(() => {
                    console.error(`Download timed out for image ${responseId}`);
                    reject(`Download timed out for image ${responseId}`);
                }, timeout);

                GM_xmlhttpRequest({
                    method: 'GET',
                    url: imageUrl,
                    headers: {
                        'Referer': 'https://ideogram.ai/',
                        'Authorization': `Bearer ${bearerToken}`,
                        'Origin': 'https://ideogram.ai'
                    },
                    responseType: 'blob',
                    onload: function(response) {
                        clearTimeout(timeoutHandle);
                        if (response.status >= 200 && response.status < 300) {
                            const blob = new Blob([response.response], { type: 'image/png' });
                            const a = document.createElement('a');
                            const url = URL.createObjectURL(blob);
                            a.href = url;
                            a.download = `downloaded_image_${responseId}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            console.log(`Downloaded image: ${responseId}`);
                            resolve();
                        } else {
                            console.error(`Error downloading image ${responseId}:`, response.statusText);
                            reject(`Error downloading image ${responseId}`);
                        }
                    },
                    onerror: function(error) {
                        clearTimeout(timeoutHandle);
                        console.error(`Error downloading image ${responseId}:`, error);
                        reject(`Error downloading image ${responseId}`);
                    }
                });
            });
        } catch (error) {
            attempts++;
            if (attempts > maxRetries) {
                console.error(`Failed to download image ${responseId} after ${maxRetries + 1} attempts.`);
                throw error;
            } else {
                console.log(`Retrying download for image ${responseId} (Attempt ${attempts}/${maxRetries + 1})...`);
                await window.idioUtils.sleep(1000); // Wait 1 second before retrying
            }
        }
    }
}

// Export API functions
window.idioApi = {
    STYLE_EXPERT,
    getHeaders,
    fetchApi,
    postApi,
    deleteApi,
    submitEvent,
    downloadImageWithTimeout,
    
    // Getters for auth state
    getAuthState: () => window.authState || { bearerToken: "", userId: "", userHandle: "" }
}; 