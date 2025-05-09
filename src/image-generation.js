/**
 * Image generation functions for Idiotagrama Patcher
 */

// State for image generation
let prompts = [];
let autoInterval;
let prependText = "";
let appendText = "";
let timerInterval;
let elapsed = 0;
const intervalDuration = 125000; // Interval duration for automatic generation

// Function to run image generation with a random prompt
function runImageGeneration() {
    const { getRandomPrompt } = window.idioUtils;
    const { STYLE_EXPERT, getAuthState, submitEvent, postApi } = window.idioApi;
    
    let prompt = getRandomPrompt(prompts);
    if (!prompt) return;

    // Apply prepend and append texts if they exist
    prompt = `${prependText} ${prompt} ${appendText}`.trim();

    const initialUrl = 'https://ideogram.ai/api/e/submit';
    const sampleUrl = 'https://ideogram.ai/api/images/sample';

    // Submit the initial event
    submitEvent("V2_GENERATION", { prompt })
        .then(() => {
            // Define the payload for the image generation request
            const { userId } = getAuthState();
            const samplePayload = {
                prompt: prompt,
                model_version: "V_1_5",
                private: true,
                resolution: { width: 1024, height: 1024 },
                sampling_speed: -2,
                style_expert: STYLE_EXPERT,
                use_autoprompt_option: "AUTO",
                user_id: userId || ""
            };

            // Send the image generation request
            return postApi(sampleUrl, samplePayload);
        })
        .then(response => {
            console.log('Image sample generation success:', response);
        })
        .catch(error => {
            console.error('Error in image generation:', error);
        });
}

// Function to set prompts from loaded file
function setPrompts(loadedPrompts) {
    prompts = loadedPrompts;
    console.log('Prompts loaded:', prompts);
}

// Function to start automatic image generation
function startAutoGeneration() {
    if (autoInterval) {
        console.warn('Auto generation is already running.');
        return;
    }

    // Prompt user for prepend/append texts
    prependText = prompt('Enter any text to prepend to each prompt (or leave blank):', '') || "";
    appendText = prompt('Enter any text to append to each prompt (or leave blank):', '') || "";

    autoInterval = setInterval(() => {
        runImageGeneration();
        elapsed = 0; // Reset elapsed time after each request
    }, intervalDuration);

    // Start progress logging every 10 seconds
    timerInterval = setInterval(() => {
        elapsed += 10000;
        const percentage = Math.min((elapsed / intervalDuration) * 100, 100).toFixed(2);
        console.log(`Progress: ${percentage}% until next request`);
    }, 10000);
}

// Function to stop automatic image generation
function stopAutoGeneration() {
    if (!autoInterval) {
        console.warn('Auto generation is not running.');
        return;
    }

    clearInterval(autoInterval);
    clearInterval(timerInterval);
    autoInterval = null;
    timerInterval = null;
    console.log('Auto generation stopped.');
}

// Export image generation functions
window.idioImageGen = {
    setPrompts,
    runImageGeneration,
    startAutoGeneration,
    stopAutoGeneration
}; 