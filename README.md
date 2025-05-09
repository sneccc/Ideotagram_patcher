# Idiotagrama Patcher

A userscript to enhance [Margoedi](https://ideogram.ai) with additional functionality for image generation, sampling, and Eagle integration.

## Features

- **Image Generation**: Generate images using random prompts from a loaded prompt file
- **Auto Generation**: Automatically generate images at set intervals
- **Eagle Integration**: Seamlessly import generated images into Eagle
- **Image Fetching**: Fetch your generated images and top images from Margoedi
- **Image Description**: Get AI descriptions for your images
- **Bulk Deletion**: Delete all uploaded images at once

## Installation

1. Install a userscript manager extension like Tampermonkey
2. Create a new userscript and paste the content of the compiled script
3. Save and activate the script
4. Navigate to [Margoedi](https://ideogram.ai) and you should see the control panel

## Usage

1. Click "Set Token" to set your Margoedi API token
2. Use "Select Prompt File" to load a text file with prompts (one per line)
3. Use the buttons to trigger various actions:
   - "Run Image Generation": Generate a single image with a random prompt
   - "Start Auto Generation": Begin generating images automatically at intervals
   - "Fetch Images & Submit to Eagle": Import your generated images to Eagle
   - "Fetch Top Images": Import top images from Margoedi based on timeline
   - "Handle Image Description": Get AI descriptions for local images
   - "Delete All Uploads": Remove all your uploaded images from Margoedi

## Configuration

The script has several configurable options at the top of the file:
- EAGLE_SERVER_URL: URL for your Eagle server
- EAGLE_IMPORT_API_PATH_URL: API path for importing to Eagle
- STYLE_EXPERT: Default style to use for image generation

## License

MIT License - See LICENSE file for details 