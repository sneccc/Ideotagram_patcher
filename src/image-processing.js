/**
 * Image processing functions for Idiotagrama Patcher
 */

// Function to fetch images and info via the API and submit to Eagle
async function fetchImagesAndSubmitToEagle() {
    const { getAuthState, fetchApi, downloadImageWithTimeout } = window.idioApi;
    const { sleep } = window.idioUtils;
    const { submitImageToEagle } = window.idioEagle;
    const { urlExists, addUrlToDatabase } = window.idioDB;
    
    const { bearerToken, userId } = getAuthState();
    const db = window.idioDB.initDatabase();
    
    if (!bearerToken) {
        console.error('Bearer token is not set. Click "Set Token" to set it.');
        return;
    }

    if (!userId) {
        console.error('User ID is not set. Click "Set Token" to set it.');
        return;
    }

    let page = 0;
    let hasMorePages = true;

    while (hasMorePages) {
        const apiUrl = `https://ideogram.ai/api/g/u?user_id=${userId}&all_privacy=true&filters=generations&page=${page}`;

        try {
            const response = await fetchApi(apiUrl);
            if (response.length === 0) {
                console.log('No more pages to process.');
                hasMorePages = false;
                break;
            }

            // Process each item in the response
            for (const item of response) {
                const userPrompt = item.user_prompt;
                const requestId = item.request_id;
                const responses = item.responses;

                for (let index = 0; index < responses.length; index++) {
                    const responseItem = responses[index];
                    const responseId = responseItem.response_id;
                    const prompt = responseItem.prompt;
                    const styleExpert = responseItem.style_expert;

                    // Construct image download URL
                    const imageUrl = `https://ideogram.ai/api/download/response/${responseId}/image?quality=PNG`;

                    // Check if the image has been processed before
                    const exists = await urlExists(db, imageUrl);
                    if (exists) {
                        console.log(`Skipping already downloaded URL`);
                        continue; // Skip URLs that are already in the database
                    }

                    // Download image locally with a timeout
                    try {
                        await downloadImageWithTimeout(imageUrl, responseId);
                        
                        // Construct website URL
                        const websiteUrl = `https://ideogram.ai/g/${requestId}/${index}`;

                        // Submit image to Eagle
                        const localPath = `P://downloads/downloaded_image_${responseId}.png`;
                        await submitImageToEagle(localPath, websiteUrl, prompt, [styleExpert]);
                        
                        // Add the URL to the database after successful processing
                        await addUrlToDatabase(db, imageUrl);
                        
                        // Add a delay between downloads to avoid overloading the server
                        await sleep(500); // 0.5 second delay
                    } catch (error) {
                        console.error(`Error processing image ${responseId}:`, error);
                        // Continue with the next image
                    }
                }
            }

            page++;
        } catch (error) {
            console.error('Error fetching API data:', error);
            hasMorePages = false;
        }
    }
}

// Function to fetch top images based on timeline and submit to Eagle
async function fetchTopImagesAndSubmitToEagle(timeline = 'ALL') {
    const { getAuthState, submitEvent, downloadImageWithTimeout } = window.idioApi;
    const { sleep, capitalizeFirstLetter } = window.idioUtils;
    const { submitImageToEagle } = window.idioEagle;
    const { urlExists, addUrlToDatabase } = window.idioDB;
    
    const { bearerToken, userId, userHandle } = getAuthState();
    const db = window.idioDB.initDatabase();
    
    if (!bearerToken) {
        console.error('Bearer token is not set. Click "Set Token" to set it.');
        return;
    }

    // First, submit the required event to obtain permission
    try {
        // Submit explore filter event with the selected timeline
        await submitEvent("HOME_V2_EXPLORE_FILTER_DROPDOWN_SELECT", {
            buttonName: timeline === 'ALL' ? 'All' : capitalizeFirstLetter(timeline.toLowerCase())
        });
        
        // Start fetching images
        let offset = 0;
        const limit = 60; // Number of results per request
        let hasMoreResults = true;

        while (hasMoreResults) {
            const apiUrl = 'https://ideogram.ai/api/gallery/global-search';
            const payload = {
                offset: offset,
                context: 'TOP',
                filters: {},
            };

            // Set the timeline in the payload
            if (timeline && timeline !== 'ALL') {
                payload.timeline = timeline;
            }

            try {
                // Fetch gallery data with POST
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearerToken}`,
                        'Referer': 'https://ideogram.ai/t/explore',
                        'Origin': 'https://ideogram.ai'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`Error fetching gallery data: ${response.statusText}`);
                }
                
                const data = await response.json();
                const results = data.results || [];
                console.log(`Fetched ${results.length} items from the API.`);

                if (results.length === 0) {
                    console.log('No more images to process.');
                    hasMoreResults = false;
                    break;
                }

                // Process each item
                for (const item of results) {
                    const itemUserId = item.user?.user_id;
                    const requestId = item.request_id;
                    const userHandle = item.user?.display_handle || 'unknown_user';
                    const modelVersion = item.model_version || 'unknown_model';

                    for (const responseItem of item.responses) {
                        const responseId = responseItem.response_id;
                        const prompt = responseItem.prompt;
                        const styleExpert = responseItem.style_expert || 'DEFAULT';
                        const numLikes = responseItem.num_likes || 0;

                        // Construct image download URL
                        const imageUrl = `https://ideogram.ai/api/download/response/${responseId}/image?quality=PNG`;

                        // Check if the image has been processed before
                        const exists = await urlExists(db, imageUrl);
                        if (exists) {
                            console.log(`Skipping already downloaded URL`);
                            continue; // Skip URLs that are already in the database
                        }

                        try {
                            // Download image locally with retries
                            await downloadImageWithTimeout(imageUrl, responseId);

                            // Construct website URL
                            const websiteUrl = `https://ideogram.ai/g/${requestId}`;

                            // Tags and metadata
                            const localPath = `P://downloads/downloaded_image_${responseId}.png`;
                            const tags = [timeline]; // Add the timeline as a tag
                            if (styleExpert && styleExpert !== "DEFAULT") {
                                tags.push(styleExpert);
                            }
                            if (modelVersion) {
                                tags.push(`model_version:${modelVersion}`);
                            }
                            // Adding user handle as a tag
                            if (userHandle) {
                                tags.push(`user:${userHandle}`);
                            }

                            const title = `ideogram_image_${numLikes}_likes`;

                            // Submit image to Eagle
                            await submitImageToEagle(localPath, websiteUrl, prompt, tags, title);

                            // Add the URL to the database
                            await addUrlToDatabase(db, imageUrl);

                            // Add a delay between downloads
                            await sleep(500);
                        } catch (error) {
                            console.error(`Error processing image ${responseId}:`, error);
                            // Continue with the next image
                        }
                    }
                }

                offset += limit;
            } catch (error) {
                console.error('Error fetching gallery data:', error);
                hasMoreResults = false;
            }
        }
    } catch (error) {
        console.error('Error submitting explore filter event:', error);
    }
}

// Function to handle image description and submission to Eagle
async function handleImageDescription() {
    const { getAuthState } = window.idioApi;
    const { sleep } = window.idioUtils;
    const { submitImageToEagle } = window.idioEagle;
    
    const { bearerToken } = getAuthState();
    
    if (!bearerToken) {
        console.error('Bearer token is not set. Click "Set Token" to set it.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async (e) => {
        const files = e.target.files;
        if (files.length === 0) {
            console.warn('No files selected.');
            return;
        }

        // Prompt user for the base path where these images are located
        const basePath = prompt('Enter the folder path where these images are located (e.g., P:/downloads/):', 'P:/downloads/');
        if (!basePath) {
            console.warn('No path provided.');
            return;
        }

        // Prompt user for the Eagle folder ID
        const eagleFolderId = prompt('Enter the Eagle folder ID to use:', 'M38ZJIG4ZBVI9');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fullPath = `${basePath}${file.name}`;

            // Wait 1 second between each iteration
            if (i > 0) {
                await sleep(1000);
            }

            try {
                // Process the file
                const caption = await describeImage(file);
                console.log(`Image description for "${file.name}":`, caption);

                // Submit to Eagle using the full path
                await submitImageToEagle(fullPath, "", caption, [], "ideogram_described", eagleFolderId);
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
    };

    input.click();
}

// Function to get image description from Ideogram API
async function describeImage(file) {
    const { getAuthState, submitEvent } = window.idioApi;
    const { sleep } = window.idioUtils;
    
    const { bearerToken, userId, userHandle } = getAuthState();
    
    try {
        // Step 1: Upload the image
        const uploadUrl = 'https://ideogram.ai/api/uploads/upload';
        const formData = new FormData();
        formData.append('file', file, file.name);

        const headers = {};
        if (bearerToken) {
            headers['Authorization'] = `Bearer ${bearerToken}`;
        }

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error(`Error uploading image: ${uploadResponse.statusText}`);
        }

        const uploadData = await uploadResponse.json();

        if (!uploadData.success || !uploadData.id) {
            throw new Error(`Error uploading image: ${uploadData.error_message || 'Unknown error'}`);
        }

        const imageId = uploadData.id;
        
        // Step 2: Submit the describe event
        await submitEvent("UPLOAD_DESCRIBE_CLICK", {
            path: "/t/my-images",
            sessionId: "0e3ee181-d130-4bc9-a556-f17246c059a8_" + Date.now()
        });
        
        // Step 3: Request the description
        return await requestDescription(imageId);
    } catch (error) {
        console.error('Error describing image:', error);
        throw error;
    }
}

// Function to request image description with retries
async function requestDescription(imageId, retryCount = 0, maxRetries = 2) {
    const { getAuthState } = window.idioApi;
    const { sleep } = window.idioUtils;
    
    const { bearerToken } = getAuthState();
    const describeUrl = 'https://ideogram.ai/api/describe';

    const payload = {
        image_id: imageId
    };

    const headers = {
        'Content-Type': 'application/json',
        'Referer': 'https://ideogram.ai/t/my-images',
        'Origin': 'https://ideogram.ai'
    };

    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    try {
        const response = await fetch(describeUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (retryCount < maxRetries) {
                console.log(`Retry ${retryCount + 1} for image ${imageId}. Waiting 1 second...`);
                await sleep(1000);
                return requestDescription(imageId, retryCount + 1, maxRetries);
            }
            throw new Error(`Error in request description after ${maxRetries} retries: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].caption;
        } else {
            if (retryCount < maxRetries) {
                console.log(`No caption received. Retry ${retryCount + 1} for image ${imageId}. Waiting 1 second...`);
                await sleep(1000);
                return requestDescription(imageId, retryCount + 1, maxRetries);
            }
            return 'No description available';
        }
    } catch (error) {
        if (retryCount < maxRetries) {
            console.log(`Error occurred. Retry ${retryCount + 1} for image ${imageId}. Waiting 1 second...`);
            await sleep(1000);
            return requestDescription(imageId, retryCount + 1, maxRetries);
        }
        console.error('Error requesting description after all retries:', error);
        return 'No description available'; // Return a default message instead of throwing
    }
}

// Function to delete all uploads
async function deleteAllUploads() {
    const { getAuthState, fetchApi, submitEvent, deleteApi } = window.idioApi;
    
    const { bearerToken, userId, userHandle } = getAuthState();
    
    if (!bearerToken) {
        console.error('Bearer token is not set. Click "Set Token" to set it.');
        return;
    }

    if (!userId) {
        console.error('User ID is not set. Click "Set Token" to set it.');
        return;
    }

    let page = 0;
    let hasMorePages = true;
    let allImageIds = [];

    // Step 1: Collect all image IDs
    while (hasMorePages) {
        const apiUrl = `https://ideogram.ai/api/g/u?user_id=${userId}&all_privacy=true&filters=upload&page=${page}`;

        try {
            const response = await fetchApi(apiUrl);
            if (response.length === 0) {
                console.log('No more uploads to process.');
                hasMorePages = false;
                break;
            }

            // Collect image_ids
            for (const item of response) {
                const imageId = item.image_id;
                if (imageId) {
                    console.log(`Added Image ID: ${imageId} to delete`);
                    allImageIds.push(imageId);
                }
            }

            page++;
        } catch (error) {
            console.error('Error fetching uploads:', error);
            hasMorePages = false;
        }
    }

    if (allImageIds.length === 0) {
        console.log('No uploads found to delete.');
        return;
    }

    // Step 2: Submit the BULK_DELETE event
    try {
        await submitEvent("BULK_DELETE", {
            path: "/t/my-images",
            sessionId: "0e3ee181-d130-4bc9-a556-f17246c059a8_" + Date.now(),
            selectedCount: allImageIds.length
        });
        
        // Step 3: Send DELETE request
        const deleteUrl = 'https://ideogram.ai/api/uploads/delete';
        const deletePayload = {
            image_ids: allImageIds
        };

        const response = await deleteApi(deleteUrl, deletePayload);
        console.log('Uploads deleted successfully:', response);
    } catch (error) {
        console.error('Error deleting uploads:', error);
    }
}

// Export image processing functions
window.idioImageProc = {
    fetchImagesAndSubmitToEagle,
    fetchTopImagesAndSubmitToEagle,
    handleImageDescription,
    describeImage,
    deleteAllUploads
}; 