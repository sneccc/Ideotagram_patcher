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
        const input = prompt(
            'Enter your Bearer token, User ID, and User Handle separated by comma.\nFormat: token,userid,userhandle\nTo clear a value, leave its part empty (e.g., "token,,handle" clears User ID).',
            `${IDIO.API.settings.bearerToken},${IDIO.API.settings.userId},${IDIO.API.settings.userHandle}`
        );

        if (input === null) { // User pressed cancel
            console.log('Token setting cancelled.');
            return;
        }

        const parts = input.split(',');
        const tokenInput = (parts[0] !== undefined ? parts[0] : "").trim();
        const userIdInput = parts.length > 1 ? (parts[1] !== undefined ? parts[1] : "").trim() : undefined;
        const userHandleInput = parts.length > 2 ? (parts[2] !== undefined ? parts[2] : "").trim() : undefined;

        // Use the API method for setting auth details
        const { bearerToken, userId, userHandle } = IDIO.API.setAuthDetails(tokenInput, userIdInput, userHandleInput);

        window.idioUI.showNotification('Authentication details set successfully.', 'info');
        console.log('Configuration updated:');
        console.log(`Bearer Token: ${bearerToken}`);
        console.log(`User ID: ${userId}`);
        console.log(`User Handle: ${userHandle}`);
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