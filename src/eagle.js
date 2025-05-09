/**
 * Eagle integration for Idiotagrama Patcher
 */

// Configuration
const EAGLE_SERVER_URL = "http://localhost:41595";
const EAGLE_IMPORT_API_PATH_URL = `${EAGLE_SERVER_URL}/api/item/addFromPaths`;
const DEFAULT_EAGLE_FOLDER_ID = "KEHB8I2C9F23H"; // Default Eagle folder ID

// Function to submit image to Eagle from a local path
function submitImageToEagle(imagePath, websiteUrl, annotation, tags = [], title = "ideogram_image", folderId = DEFAULT_EAGLE_FOLDER_ID) {
    const data = {
        items: [
            {
                path: imagePath,
                name: title,
                website: websiteUrl,
                tags: tags,
                annotation: annotation
            }
        ],
        folderId: folderId
    };

    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'POST',
            url: EAGLE_IMPORT_API_PATH_URL,
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    console.log(`Image "${title}" added to Eagle successfully.`);
                    resolve(response);
                } else {
                    console.error(`Error adding image "${title}" to Eagle:`, response.statusText);
                    reject(response.statusText);
                }
            },
            onerror: function(error) {
                console.error('Error in Eagle API request:', error);
                reject(error);
            }
        });
    });
}

// Export Eagle integration
window.idioEagle = {
    EAGLE_SERVER_URL,
    EAGLE_IMPORT_API_PATH_URL,
    DEFAULT_EAGLE_FOLDER_ID,
    submitImageToEagle
}; 