# Margoedi Tools

A userscript to enhance [Margoedi](https://ideogram.ai) with additional functionality for image generation, sampling, and Eagle integration.

> **Note:** The name "Margoedi" is used throughout the codebase as a simple obfuscation for "Ideogram" (spelled backwards) to reduce the chance of this repository being found through keyword searches.

## Features

- **Image Generation**: Generate images using random prompts from a loaded prompt file
- **Auto Generation**: Automatically generate images at set intervals
- **Eagle Integration**: Seamlessly import generated images into Eagle
- **Image Fetching**: Fetch your generated images and top images from Margoedi
- **Image Description**: Get AI descriptions for your images
- **Bulk Deletion**: Delete all uploaded images at once

## Installation

### Option 1: Using the GitHub Loader (Recommended)

1. Install a userscript manager extension like [Tampermonkey](https://www.tampermonkey.net/)
2. Create a new userscript and paste the content of `margoedi.user.js`
3. Update the `REPO_URL` variable in the script to point to your forked repository
4. Save and activate the script

The loader script will automatically download all the required modules from GitHub and run them in the correct order.

### Option 2: Using the Combined Script

If you prefer a single file solution:

1. Install a userscript manager extension like [Tampermonkey](https://www.tampermonkey.net/)
2. Run `node build.js` to generate the combined script
3. Create a new userscript and paste the content of the generated `margoedi.user.js`
4. Save and activate the script

## Setup for Developers

If you want to modify the code and create your own version:

1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/margoedi-tools.git`
3. Navigate to the project: `cd margoedi-tools`
4. Make your changes to the files in the `src` directory
5. Commit and push your changes
6. Update the `REPO_URL` in `margoedi.user.js` to point to your repository

## Usage

1. Navigate to [Margoedi](https://ideogram.ai) and you should see the control panel
2. Click "Set Token" to set your Margoedi API token
3. Use "Select Prompt File" to load a text file with prompts (one per line)
4. Use the buttons to trigger various actions:
   - "Run Image Generation": Generate a single image with a random prompt
   - "Start Auto Generation": Begin generating images automatically at intervals
   - "Fetch Images & Submit to Eagle": Import your generated images to Eagle
   - "Fetch Top Images": Import top images from Margoedi based on timeline
   - "Handle Image Description": Get AI descriptions for local images
   - "Delete All Uploads": Remove all your uploaded images from Margoedi

## Configuration

The script has several configurable options at the top of the `eagle.js` and `api.js` files:
- EAGLE_SERVER_URL: URL for your Eagle server
- EAGLE_IMPORT_API_PATH_URL: API path for importing to Eagle
- DEFAULT_EAGLE_FOLDER_ID: Default Eagle folder ID to use
- STYLE_EXPERT: Default style to use for image generation

## License

MIT License - See LICENSE file for details 