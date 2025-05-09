const fs = require('fs');
const path = require('path');

// Configuration
const srcDir = path.join(__dirname, 'src');
const outputFile = path.join(__dirname, 'margoedi.user.js');

// Order of files to include
const files = [
    'header.js',     // Userscript header
    'utils.js',      // Utility functions
    'db.js',         // Database operations
    'eagle.js',      // Eagle integration
    'api.js',        // API interactions
    'image-generation.js', // Image generation logic
    'image-processing.js', // Image processing logic
    'ui.js',         // User interface components
    'main.js'        // Main controller
];

// Function to build the userscript
function buildUserscript() {
    let content = '';
    
    console.log('Building Margoedi Tools userscript...');
    
    // Add IIFE wrapper start
    content += `(function() {\n`;
    
    // Add each file content
    files.forEach(file => {
        const filePath = path.join(srcDir, file);
        
        if (fs.existsSync(filePath)) {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            
            // For the first file (header.js), don't include it within the IIFE
            if (file === 'header.js') {
                content = fileContent + '\n\n' + content;
            } else {
                // Strip out window.* exports since they'll all be in one scope
                fileContent = fileContent.replace(/window\.idio[a-zA-Z]+ = \{[^}]+\};/g, '');
                
                // Add file content with a comment to indicate the source file
                content += `\n// ===== ${file} =====\n`;
                content += fileContent + '\n';
            }
            
            console.log(`Added ${file}`);
        } else {
            console.error(`File not found: ${filePath}`);
        }
    });
    
    // Add IIFE wrapper end
    content += `})();\n`;
    
    // Write output file
    fs.writeFileSync(outputFile, content);
    
    console.log(`\nUserscript built successfully: ${outputFile}`);
    console.log(`Total size: ${(content.length / 1024).toFixed(2)} KB`);
}

// Run the build process
buildUserscript(); 