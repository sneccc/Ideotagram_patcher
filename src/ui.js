/**
 * UI components for Idiotagrama Patcher
 */

// Create the UI panel
function createUI() {
    // Create a container div
    const container = document.createElement('div');
    container.id = 'idiotagrama-panel';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '9999';
    container.style.backgroundColor = 'black';
    container.style.border = '1px solid #333';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.cursor = 'move';
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    container.style.msUserSelect = 'none';
    container.style.transition = 'height 0.3s ease-in-out';

    // Create content wrapper for minimize/maximize
    const contentWrapper = document.createElement('div');
    contentWrapper.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add drag handle at the top with minimize button
    const dragHandle = document.createElement('div');
    dragHandle.style.width = '100%';
    dragHandle.style.height = '20px';
    dragHandle.style.backgroundColor = '#333';
    dragHandle.style.marginBottom = '10px';
    dragHandle.style.borderRadius = '3px';
    dragHandle.style.cursor = 'move';
    dragHandle.style.position = 'relative';
    dragHandle.style.display = 'flex';
    dragHandle.style.justifyContent = 'flex-end';
    dragHandle.style.alignItems = 'center';

    // Add minimize/maximize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.textContent = '−';
    minimizeBtn.style.width = '20px';
    minimizeBtn.style.height = '20px';
    minimizeBtn.style.padding = '0';
    minimizeBtn.style.backgroundColor = 'transparent';
    minimizeBtn.style.border = 'none';
    minimizeBtn.style.color = 'white';
    minimizeBtn.style.fontSize = '16px';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.style.display = 'flex';
    minimizeBtn.style.justifyContent = 'center';
    minimizeBtn.style.alignItems = 'center';
    minimizeBtn.style.marginRight = '5px';

    let isMinimized = false;
    const originalHeight = 'auto';
    const minimizedHeight = '40px';

    minimizeBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent drag event
        isMinimized = !isMinimized;
        
        if (isMinimized) {
            container.style.height = minimizedHeight;
            contentWrapper.style.opacity = '0';
            contentWrapper.style.display = 'none';
            minimizeBtn.textContent = '+';
        } else {
            container.style.height = originalHeight;
            contentWrapper.style.display = 'block';
            setTimeout(() => {
                contentWrapper.style.opacity = '1';
            }, 50);
            minimizeBtn.textContent = '−';
        }
    };

    dragHandle.appendChild(minimizeBtn);
    container.appendChild(dragHandle);
    container.appendChild(contentWrapper);

    // Add the buttons
    addButtons(contentWrapper);
    
    // Add the timeline dropdown
    addTimelineDropdown(contentWrapper);

    // Make the panel draggable
    makeDraggable(container, dragHandle);

    document.body.appendChild(container);
}

// Function to create and add buttons to the panel
function addButtons(container) {
    const actions = [
        { name: 'Set Token', action: 'setBearerToken' },
        { name: 'Select Prompt File', action: 'handlePromptFileSelect' },
        { name: 'Run Image Generation', action: 'runImageGeneration' },
        { name: 'Start Auto Generation', action: 'startAutoGeneration' },
        { name: 'Stop Auto Generation', action: 'stopAutoGeneration' },
        { name: 'Fetch Images & Submit to Eagle', action: 'fetchImagesAndSubmitToEagle' },
        { name: 'Handle Image Description', action: 'handleImageDescription' },
        { name: 'Delete All Uploads', action: 'deleteAllUploads' }
    ];

    actions.forEach(act => {
        const button = createButton(act.name, act.action);
        container.appendChild(button);
    });
}

// Function to create a button
function createButton(text, action) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.display = 'block';
    button.style.margin = '5px 0';
    button.style.backgroundColor = '#333';
    button.style.color = 'white';
    button.style.border = '1px solid #444';
    button.style.padding = '5px 10px';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    button.style.width = '100%';
    button.dataset.action = action;

    // Hover effect
    button.onmouseover = () => {
        button.style.backgroundColor = '#444';
    };
    button.onmouseout = () => {
        button.style.backgroundColor = '#333';
    };

    // Click handler
    button.onclick = () => {
        console.log(`Button "${text}" clicked.`);
        window.idioController.handleButtonClick(action);
    };

    return button;
}

// Function to add the timeline dropdown
function addTimelineDropdown(container) {
    // Create label
    const label = document.createElement('div');
    label.textContent = 'Timeline for Top Images:';
    label.style.color = 'white';
    label.style.margin = '10px 0 5px 0';
    label.style.fontSize = '12px';
    container.appendChild(label);
    
    // Create dropdown
    const timelineDropdown = document.createElement('select');
    timelineDropdown.id = 'timelineDropdown';
    timelineDropdown.style.display = 'block';
    timelineDropdown.style.margin = '5px 0';
    timelineDropdown.style.width = '100%';
    timelineDropdown.style.backgroundColor = '#333';
    timelineDropdown.style.color = 'white';
    timelineDropdown.style.border = '1px solid #444';
    timelineDropdown.style.padding = '5px 10px';
    timelineDropdown.style.borderRadius = '3px';
    timelineDropdown.style.cursor = 'pointer';
    // Remove default dropdown arrow styling
    timelineDropdown.style.appearance = 'none';
    timelineDropdown.style.webkitAppearance = 'none';
    timelineDropdown.style.mozAppearance = 'none';

    const timelines = ['ALL', 'HOUR', 'DAY', 'WEEK', 'MONTH'];
    timelines.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time.charAt(0) + time.slice(1).toLowerCase();
        option.style.backgroundColor = '#333';
        option.style.color = 'white';
        timelineDropdown.appendChild(option);
    });

    // Add hover effect
    timelineDropdown.onmouseover = () => {
        timelineDropdown.style.backgroundColor = '#444';
    };
    timelineDropdown.onmouseout = () => {
        timelineDropdown.style.backgroundColor = '#333';
    };

    // Add focus effect
    timelineDropdown.onfocus = () => {
        timelineDropdown.style.backgroundColor = '#444';
        timelineDropdown.style.outline = 'none';
        timelineDropdown.style.boxShadow = '0 0 0 1px #666';
    };
    timelineDropdown.onblur = () => {
        timelineDropdown.style.backgroundColor = '#333';
        timelineDropdown.style.boxShadow = 'none';
    };

    container.appendChild(timelineDropdown);

    // Add the fetch top images button
    const fetchTopImagesButton = createButton('Fetch Top Images', 'fetchTopImagesAndSubmitToEagle');
    container.appendChild(fetchTopImagesButton);
}

// Function to make an element draggable
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        // If it's positioned at left, switch to left positioning
        if (parseInt(element.style.left) < window.innerWidth / 2) {
            element.style.left = parseInt(element.style.left) + "px";
            element.style.right = 'auto';
        } else {
            element.style.right = (window.innerWidth - parseInt(element.style.left) - element.offsetWidth) + "px";
            element.style.left = 'auto';
        }
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Function to show a notification/toast message
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = type === 'error' ? '#e74c3c' : '#2ecc71';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    toast.style.opacity = '0';

    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Fade out and remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Export UI functions
window.idioUI = {
    createUI,
    showNotification
}; 