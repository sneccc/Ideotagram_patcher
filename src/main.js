/**
 * Main controller for Idiotagrama Patcher
 */

// Controller for handling UI events and interactions
const Controller = {
    // Handle button clicks from UI
    handleButtonClick: function(action) {
        switch (action) {
            case 'setBearerToken':
                this.setBearerToken();
                break;
            case 'handlePromptFileSelect':
                this.handlePromptFileSelect();
                break;
            case 'runImageGeneration':
                window.idioImageGen.runImageGeneration();
                break;
            case 'startAutoGeneration':
                window.idioImageGen.startAutoGeneration();
                break;
            case 'stopAutoGeneration':
                window.idioImageGen.stopAutoGeneration();
                break;
            case 'fetchImagesAndSubmitToEagle':
                window.idioImageProc.fetchImagesAndSubmitToEagle();
                break;
            case 'fetchTopImagesAndSubmitToEagle':
                const timeline = document.getElementById('timelineDropdown').value || 'ALL';
                window.idioImageProc.fetchTopImagesAndSubmitToEagle(timeline);
                break;
            case 'handleImageDescription':
                window.idioImageProc.handleImageDescription();
                break;
            case 'deleteAllUploads':
                this.confirmAction(
                    'Are you sure you want to delete ALL uploads? This cannot be undone.',
                    () => window.idioImageProc.deleteAllUploads()
                );
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    },

    // Set bearer token and user info
    setBearerToken: function() {
        const input = prompt('Enter your Bearer token and User ID and User Handle (optional) separated by comma:\nFormat: token,userid,userhandle', '');
        if (!input) return;

        const [token, inputUserId, inputUserHandle] = input.split(',').map(s => s.trim());

        if (!token) {
            window.idioUI.showNotification('No Bearer token was provided.', 'error');
            return;
        }

        const { bearerToken, userId, userHandle } = window.idioApi.setAuthDetails(token, inputUserId, inputUserHandle);

        window.idioUI.showNotification('Authentication details set successfully.', 'info');
        console.log('Bearer token set successfully.');
        console.log(`User ID set to: ${userId}`);
        console.log(`User Handle set to: ${userHandle}`);
    },

    // Handle prompt file selection
    handlePromptFileSelect: function() {
        window.idioUtils.handleFileSelect(prompts => {
            window.idioImageGen.setPrompts(prompts);
            window.idioUI.showNotification(`Loaded ${prompts.length} prompts.`, 'info');
        });
    },

    // Confirm action with user dialog
    confirmAction: function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }
};

// Initialize the application
function init() {
    console.log('Idiotagrama Patcher initializing...');
    
    // Create the UI
    window.idioUI.createUI();
    
    // Expose the controller
    window.idioController = Controller;
    
    console.log('Idiotagrama Patcher initialized successfully.');
}

// Execute the init function when the page is fully loaded
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}

// Export the controller
window.idioController = Controller; 