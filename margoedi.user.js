// ==UserScript==
// @name         Margoedi Tools
// @namespace    https://margoedi.ai/
// @version      1.0
// @description  UI for image generation, automatic generation, image fetching, and bulk deletion for Margoedi
// @match        https://ideogram.ai/*
// @require      https://unpkg.com/dexie/dist/dexie.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// ==/UserScript== 

(function() {
    'use strict';
    
    // Base URL for the GitHub repository
    const REPO_URL = 'https://raw.githubusercontent.com/sneccc/Ideotagram_patcher/main/src/';
    
    // Get stored authentication values or use defaults
    let bearerToken = GM_getValue("bearerToken", "");
    let userId = GM_getValue("userId", "");
    let userHandle = GM_getValue("userHandle", "");
    
    // Function to set the Bearer token and User ID
    function setBearerToken() {
        // Fetch current values from storage to pre-fill the prompt accurately
        const currentToken = GM_getValue('bearerToken', '');
        // Use the initial placeholder/default from the config object definition if nothing is in storage.
        // This mirrors what loadConfig would establish for config.userId / config.userHandle initially.
        const currentUserId = GM_getValue('userId', config.userId);
        const currentUserHandle = GM_getValue('userHandle', config.userHandle);

        const input = prompt(
            'Enter your Bearer token, User ID, and User Handle separated by comma.\nFormat: token,userid,userhandle\nTo clear a value, leave its part empty (e.g., "token,,handle" clears User ID).',
            `${currentToken},${currentUserId},${currentUserHandle}`
        );

        if (input === null) { // User pressed cancel
            console.log('Token setting cancelled.');
            return;
        }

        const parts = input.split(',');
        // Get trimmed input for each part, default to empty string if part is missing then trim (though split usually gives empty strings)
        const tokenInput = (parts[0] !== undefined ? parts[0] : "").trim();
        // userIdInput will be undefined if only token was entered, or "" if "token,," was entered.
        const userIdInput = parts.length > 1 ? (parts[1] !== undefined ? parts[1] : "").trim() : undefined;
        const userHandleInput = parts.length > 2 ? (parts[2] !== undefined ? parts[2] : "").trim() : undefined;

        // Always update bearer token based on input. If empty, it's cleared.
        config.bearerToken = tokenInput;
        GM_setValue('bearerToken', config.bearerToken);
        if (config.bearerToken) {
            console.log('Bearer token set successfully.');
        } else {
            console.log('Bearer token cleared or not provided.');
        }

        // User ID: If part was provided in the input (even if an empty string), update.
        // If not provided (e.g., user only entered a token), config.userId retains its current (loaded/default) value.
        if (userIdInput !== undefined) {
            config.userId = userIdInput;
            GM_setValue('userId', config.userId);
            console.log(`User ID set to: "${config.userId}"`);
        } else {
            // userIdInput is undefined, meaning user entered only "token" or submitted without changing that part.
            // config.userId already holds currentUserId (loaded from storage or the initial default).
            // No change to config.userId, and GM_setValue is not strictly needed unless ensuring default is written.
            console.log(`User ID not specified in input, remains: "${config.userId}"`);
        }

        // User Handle: If part was provided in the input, update.
        if (userHandleInput !== undefined) {
            config.userHandle = userHandleInput;
            GM_setValue('userHandle', config.userHandle);
            console.log(`User Handle set to: "${config.userHandle}"`);
        } else {
            // userHandleInput is undefined. config.userHandle retains its current value.
            console.log(`User Handle not specified in input, remains: "${config.userHandle}"`);
        }

        console.log('Configuration updated:');
        console.log(`Bearer Token: ${config.bearerToken}`);
        console.log(`User ID: ${config.userId}`);
        console.log(`User Handle: ${config.userHandle}`);
        alert('Token, User ID, and User Handle settings have been processed and saved.');
    }
    
    // List of modules to load in order
    const modules = [
        'utils.js',
        'db.js',
        'eagle.js',
        'api.js',
        'image-generation.js',
        'image-processing.js',
        'ui.js',
        'main.js'
    ];
    
    // Function to load a script from URL
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            // Execute the script
                            const scriptContent = response.responseText;
                            eval(scriptContent);
                            console.log(`Loaded module: ${url}`);
                            resolve();
                        } catch (error) {
                            console.error(`Error executing module ${url}:`, error);
                            reject(error);
                        }
                    } else {
                        console.error(`Error loading module ${url}: ${response.statusText}`);
                        reject(new Error(`Failed to load module: ${response.statusText}`));
                    }
                },
                onerror: function(error) {
                    console.error(`Error loading module ${url}:`, error);
                    reject(error);
                }
            });
        });
    }
    
    // Function to load all modules sequentially
    async function loadAllModules() {
        console.log('Margoedi Tools: Loading modules...');
        
        try {
            // Initialize and share auth state before loading modules
            updateAuthState();
            
            // Load modules in sequence
            for (const module of modules) {
                const moduleUrl = REPO_URL + module;
                await loadScript(moduleUrl);
            }
            
            console.log('Margoedi Tools: All modules loaded successfully.');
            
            // Initialize the application
            if (document.readyState === 'complete') {
                initUI();
            } else {
                window.addEventListener('load', initUI);
            }
        } catch (error) {
            console.error('Margoedi Tools: Failed to load modules:', error);
        }
    }
    
    // Function to update the authentication state
    function updateAuthState() {
        // Share auth state globally
        window.authState = { bearerToken, userId, userHandle };
        
        // Create auth state getter for consistent access
        window.getAuthState = function() {
            return {
                bearerToken: GM_getValue("bearerToken", ""),
                userId: GM_getValue("userId", ""),
                userHandle: GM_getValue("userHandle", "")
            };
        };
    }
    
    // Function to initialize the UI
    function initUI() {
        // Expose the auth state and token setter to the window
        updateAuthState();
        window.setBearerToken = setBearerToken;
        
        // Initialize the UI from the module
        if (typeof window.idioUI !== 'undefined') {
            window.idioUI.createUI();
        } else {
            console.error('Margoedi Tools: UI module not loaded properly.');
        }
    }
    
    // Start loading modules
    loadAllModules();
})();
