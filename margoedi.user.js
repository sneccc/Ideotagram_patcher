// ==UserScript==
// @name         Idiotagrama Patcher
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
        console.log('Idiotagrama Patcher: Loading modules...');
        
        try {
            // Load modules in sequence
            for (const module of modules) {
                const moduleUrl = REPO_URL + module;
                await loadScript(moduleUrl);
            }
            
            console.log('Idiotagrama Patcher: All modules loaded successfully.');
            
            // Initialize the application
            if (typeof window.idioController !== 'undefined' && document.readyState === 'complete') {
                window.idioUI.createUI();
            } else {
                window.addEventListener('load', () => {
                    window.idioUI.createUI();
                });
            }
        } catch (error) {
            console.error('Idiotagrama Patcher: Failed to load modules:', error);
        }
    }
    
    // Start loading modules
    loadAllModules();
})();
