// Stop global file drop behaviour (Browser opens file on drop)
// Source: https://stackoverflow.com/a/6756680

// Global Events Hooking (To prevent unnecessary behaviours)
window.addEventListener("dragover",function(e){e.preventDefault();},false);
window.addEventListener("drop",function(e){e.preventDefault();},false);

const fileDragDrop = document.querySelector('.file-drag-drop');

// Drag and Drop Related Functionality
fileDragDrop.addEventListener('dragover', function(event) {
    event.preventDefault();
    this.classList.add('highlight');
});

fileDragDrop.addEventListener('dragleave', function() {
    this.classList.remove('highlight');
});

fileDragDrop.addEventListener('drop', function(event) {
    event.preventDefault();

    // TODO: Basic for now, to improve later.
    if (event.dataTransfer.files[0].type !== "video/mp4")
    {
        // Show alert to user
        alert("Ideally this file (a video) should be a MP4 extension...");

        // Programmatically, invoke "dragleave" event for file drop - to allow glow effect to take place again without it being locked.
        fileDragDrop.dispatchEvent(new Event('dragleave'));
        
        return;
    }

    beginScrubProcess(event.dataTransfer.files[0]);
});

function handle(fps, fpsTarget, element)
{
    if (fps !== fpsTarget)
    {
        element.setAttribute('data-selected', 'false'); return;
    }
    window.frameRate = fpsTarget;
    element.setAttribute('data-selected', 'true')
}

const fpsOptions = [
    { fps: 15, elementId: "btn15" },
    { fps: 30, elementId: "btn30" },
    { fps: 60, elementId: "btn60" },
]

// UI logic
window.HandleFPSRate = function(fps)
{
    for (const option of fpsOptions) {
        const element = document.getElementById(option.elementId);
        if (element) { //Check if element exists
            handle(fps, option.fps, element);
        } else {
            console.warn(`Element with ID ${option.elementId} not found.`); //Helpful for debugging
        }
    }
}