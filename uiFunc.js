// Stop global file drop behaviour (Browser opens file on drop)
// Source: https://stackoverflow.com/a/6756680

window.addEventListener("dragover",function(e){e = e || event;e.preventDefault();},false);
window.addEventListener("drop",function(e){e = e || event;e.preventDefault();},false);

document.querySelector('.file-drag-drop').addEventListener('dragover', function(event) {
    event.preventDefault();
    this.classList.add('highlight');
});

document.querySelector('.file-drag-drop').addEventListener('dragleave', function() {
    this.classList.remove('highlight');
});

document.querySelector('.file-drag-drop').addEventListener('drop', function(event) {
    event.preventDefault();

    // TODO: Basic for now, to improve later.
    if (event.dataTransfer.files[0].type !== "video/mp4")
    {
        // Show alert to user
        alert("Ideally this file (a video) should be a MP4 extension...");

        // Programmatically, invoke "dragleave" event for file drop - to allow glow effect to take place again without it being locked.
        document.querySelector('.file-drag-drop').dispatchEvent(new Event('dragleave'));
        
        return;
    }

    beginScrubProcess(event.dataTransfer.files[0]);
});

// UI logic
window.HandleFPSRate = function(fps)
{
    function handle(fpsTarget, element)
    {
        if (fps !== fpsTarget)
        {
            element.setAttribute('data-selected', 'false'); return;
        }
        window.frameRate = fpsTarget;
        element.setAttribute('data-selected', 'true')
    }
    
    handle(15, document.getElementById("btn15"));
    handle(30, document.getElementById("btn30"));
    handle(60, document.getElementById("btn60"));
}
