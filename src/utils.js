/**
 * Utility functions for Idiotagrama Patcher
 */

// Sleep function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to handle file selection
function handleFileSelect(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = event => {
                const prompts = event.target.result.split('\n').filter(line => line.trim() !== '');
                callback(prompts);
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Get a random prompt from array
function getRandomPrompt(prompts) {
    if (!prompts || prompts.length === 0) {
        console.warn('No prompts loaded. Please load a prompt file first.');
        return null;
    }
    return prompts[Math.floor(Math.random() * prompts.length)];
}

// Export the utilities
window.idioUtils = {
    sleep,
    capitalizeFirstLetter,
    handleFileSelect,
    getRandomPrompt
}; 