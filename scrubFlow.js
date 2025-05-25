const videoInput = document.getElementById('videoInput');
const frameRateSelect = document.getElementById('frameRateSelect');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const videoContainer = document.getElementById('videoContainer');
const scrubber = document.getElementById('scrubber');
const overlay = document.getElementById('overlay');
let video = document.createElement('video');
let isScrubbing = false;
let targetTime = 0;

window.frameRate = 30; // Set default to 30FPS

let frames = [];
let lastFrameIDX = 0;

function videoInputChange(event)
{
    const file = event.target.files[0];
    beginScrubProcess(file);
}
videoInput.addEventListener('change', videoInputChange);

// TODO: Make each file have its own reset event, and make it a event trigger?
window.ResetToMainMenu = function() {
    frames.length = 0;
    
    resetAudio();
    
    window.CurrentVideoTitle = "";
    
    videoContainer.style.display = 'none';

    videoInput.value = "";

    // Reset User Data
    recordedFrames.length = 0;
    
    // audioTimestamps = [];
    
    lastFrameIDX = 0;
    
    recordingState = false;

    ShowExtraControls(false);

    UpdateBufferTitle("Buffering Video... Please Wait", true);

    document.querySelector("#MainMenu").style.display = 'flex';
};

window.CurrentVideoTitle = "";
window.beginScrubProcess = function (file)
{
    if (file) {
        window.CurrentVideoTitle = file.name;
        console.log(`[beginScrubProcess] Processing file: ${file.name}`)

        document.querySelector("#MainMenu").style.display = 'none';
        document.querySelector(".file-drag-drop").classList.remove('highlight');
    
        frames = [];
        stopScrubbedAudio();
        
        const url = URL.createObjectURL(file);
        video.src = url;
        video.preload = "auto";
        video.onloadeddata = extractFrames;
        videoContainer.style.display = 'flex';
        extractAudio(file);
    }
}

// [NOTE]: UI is set to "display:none" by default
const videoReset = document.querySelector("#videoReset");
function ShowExtraControls(state)
{
    if (state)
    {
        videoReset.style.display = "revert";
    }
    else
    {
        videoReset.style.display = "none";
    }
}

const videoName = document.querySelector("#videoName");
function UpdateBufferTitle(title, buffering)
{
    videoName.innerText = title;
    videoName.style.marginRight = buffering ? "0px" : "35px";
}

function FixBufferOverlayOverCanvas()
{
    // Set the actual Canvas width and height with the overlay
    overlay.style.width = `${canvas.clientWidth + 1}px`;
    overlay.style.height = `${canvas.clientHeight + 1}px`;
}

function msTimeDiff(from, now = new Date().getTime())
{
    return now - from;
}

function extractFrames() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    FixBufferOverlayOverCanvas();
    overlay.style.display = 'flex';

    const totalFrames = Math.floor(video.duration * window.frameRate);
    frames = new Array(totalFrames);

    let frameIndex = 0;
    let processStart = new Date().getTime();

    scrubber.appendChild(document.createElement("div"));
    let scrubberProcess = scrubber.children[0];
    scrubberProcess.id = "scrubber-progress";

    function captureFrame() {
        if (frameIndex >= totalFrames) {
            video.style.display = 'none';
            overlay.style.display = 'none';
            UpdateBufferTitle(window.CurrentVideoTitle, false);
            ShowExtraControls(true);
            scrubberProcess.remove();
            console.log(`[captureAllFrames] Processing took: ${msTimeDiff(processStart)}ms`)
            return;
        }

        video.currentTime = frameIndex / window.frameRate;

        // Avoids blocking of main thread, when buffering frames
        video.requestVideoFrameCallback( () => {
            let offscreen = new OffscreenCanvas(canvas.width, canvas.height);
            let ctxOff = offscreen.getContext('2d');
            ctxOff.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Only draw to visible canvas on the *first* frame (or another suitable trigger)
            if (frameIndex === 0) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            scrubberProcess.style.width = `${(frameIndex / totalFrames) * 100}%`
            frames[frameIndex] = offscreen;
            frameIndex++;
            captureFrame(); // Schedule the next frame
        });
    }

    captureFrame(); // Start the process
}

function RenderFrame(frameIDX)
{
    if (isNaN(frameIDX)) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[frameIDX], 0, 0, canvas.width, canvas.height);
    playScrubbedAudio(frameIDX / window.frameRate);
}

function handleScrub(event) {
    if (!isScrubbing || recordingPlaying) return;
    
    const rect = scrubber.getBoundingClientRect();
    
    const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    
    targetTime = Math.floor(percent * frames.length);
    
    if (frames[targetTime]) {
        RenderFrame(targetTime);
        if(recordingState) RecordCurrentFrame();       
        // TODO: Validate Index against Frames!
        // TODO: Is this bit actually needed? Review variables and its usages
        lastFrameIDX = targetTime;
    }
}

function startScrubbing(event) {
    event.preventDefault();
    isScrubbing = true;
}

function stopScrubbing() {
    isScrubbing = false;
    stopScrubbedAudio();
}

scrubber.addEventListener('mousedown', (event) => startScrubbing(event));
scrubber.addEventListener('touchstart', (event) => startScrubbing(event.touches[0]));

document.addEventListener('mousemove', (event) => handleScrub(event));
document.addEventListener('touchmove', (event) => handleScrub(event.touches[0]));

document.addEventListener('mouseup', stopScrubbing);
document.addEventListener('touchend', stopScrubbing);