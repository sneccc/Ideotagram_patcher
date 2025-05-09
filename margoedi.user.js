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
    
    // Initialize global namespace (like MJ in mj_patcher)
    window.IDIO = window.IDIO || {};
    
    // Create API/settings objects
    IDIO.API = {
        // Store settings
        settings: {
            bearerToken: GM_getValue("bearerToken", ""),
            userId: GM_getValue("userId", ""),
            userHandle: GM_getValue("userHandle", "")
        },
        
        // Add a function to save settings
        saveSettings: function() {
            GM_setValue("bearerToken", IDIO.API.settings.bearerToken);
            GM_setValue("userId", IDIO.API.settings.userId);
            GM_setValue("userHandle", IDIO.API.settings.userHandle);
            console.log("Settings saved to GM storage");
        },
        
        // Add function to set auth details from UI
        setAuthDetails: function(token, userId, userHandle) {
            IDIO.API.settings.bearerToken = token || "";
            
            // Only update if provided
            if (userId !== undefined) {
                IDIO.API.settings.userId = userId || "";
            }
            
            if (userHandle !== undefined) {
                IDIO.API.settings.userHandle = userHandle || "";
            }
            
            this.saveSettings();
            return {
                bearerToken: IDIO.API.settings.bearerToken,
                userId: IDIO.API.settings.userId,
                userHandle: IDIO.API.settings.userHandle
            };
        }
    };
    
    // For backward compatibility, maintain idioConfig and getAuthState
    window.idioConfig = IDIO.API.settings;
    window.getAuthState = function() {
        return {
            bearerToken: IDIO.API.settings.bearerToken,
            userId: IDIO.API.settings.userId,
            userHandle: IDIO.API.settings.userHandle
        };
    };
    
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
        console.log('Auth state loaded:', IDIO.API.settings);
        
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
        // Initialize the UI from the module
        if (typeof window.idioUI !== 'undefined' && typeof window.idioUI.createUI === 'function') {
            window.idioUI.createUI();
        } else {
            console.error('Margoedi Tools: UI module or createUI function not loaded properly.');
        }
    }
    
    // Start loading modules
    loadAllModules();
})();
