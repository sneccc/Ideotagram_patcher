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
    
    // Default values for authentication
    let bearerToken = ""; // Authorization token placeholder
    let userId = ""; // User ID placeholder
    let userHandle = ""; // User handle placeholder
    
    // Function to set the Bearer token and User ID
    function setBearerToken() {
        const input = prompt('Enter your Bearer token and User ID and User Handle (optional) separated by comma:\nFormat: token,userid,userhandle', '');
        if (!input) return;

        const [token, inputUserId, inputUserHandle] = input.split(',').map(s => s.trim());

        if (!token) {
            console.warn('No Bearer token was provided.');
            return;
        }

        bearerToken = token;
        userId = inputUserId || "";
        userHandle = inputUserHandle || "";

        console.log('Bearer token set successfully.');
        console.log(`User ID set to: ${userId}`);
        console.log(`User Handle set to: ${userHandle}`);
        
        // Make these values accessible to other modules
        window.authState = { bearerToken, userId, userHandle };
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
    
    // Function to initialize the UI
    function initUI() {
        // Expose the auth state and token setter to the window
        window.authState = { bearerToken, userId, userHandle };
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
