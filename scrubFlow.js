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
let audioContext, audioBuffer, audioSource;

function videoInputChange(event)
{
    const file = event.target.files[0];
    beginScrubProcess(file);
}
videoInput.addEventListener('change', videoInputChange);

// TODO: Make each file have its own reset event, and make it a event trigger?
window.ResetToMainMenu = function() {
    frames.length = 0;
    stopScrubbedAudio();
    window.CurrentVideoTitle = "";
    videoContainer.style.display = 'none';

    videoInput.value = "";

    // Reset User Data
    recordedFrames.length = 0;
    audioTimestamps = [];
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

function extractFrames() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    FixBufferOverlayOverCanvas();
    overlay.style.display = 'flex';
    
    let duration = video.duration;
    let totalFrames = Math.floor(duration * window.frameRate);
    frames = new Array(totalFrames);

    async function captureAllFrames() {
        const processStart = new Date().getTime();

        // Utilise OffscreenCanvas array to avoid Image URLS (previously, .toDataUrl())
        for (let i = 0; i < totalFrames; i++) {
            await new Promise((resolve) => {
                video.currentTime = i / window.frameRate;
                video.onseeked = () => {
                    let offscreen = new OffscreenCanvas(canvas.width, canvas.height);
                    let ctxOff = offscreen.getContext('2d');
                    ctxOff.drawImage(video, 0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames[i] = offscreen;
                    resolve();
                };
            });
        }
    
        video.style.display = 'none';
        overlay.style.display = 'none';

        UpdateBufferTitle(window.CurrentVideoTitle, false);
        ShowExtraControls(true);
        console.log(`[captureAllFrames] Processing took: ${new Date().getTime() - processStart}ms`)
    }

    captureAllFrames();
}

function extractAudio(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioBuffer = await audioContext.decodeAudioData(reader.result);
    };
}

const Audio_Buffer = 0.015; // Play only 15ms
function playScrubbedAudio(time) {
    // Introduce Audio Segment buffering to reduce CPU usage (unnecessary reallocations)
    if (!audioContext || !audioBuffer) return;

    stopScrubbedAudio();
    
    // New Approach: Slice the buffer, instead of creating a brand AudioBufferSourceNode each time
    let startOffset = Math.min(time, audioBuffer.duration - Audio_Buffer);
    let segmentLength = Math.min(Audio_Buffer, audioBuffer.duration - startOffset);

    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    audioSource.start(0, startOffset, segmentLength);
}

function stopScrubbedAudio() {
    if (audioSource) {
        audioSource.stop();
        audioSource = null;
    }
}

function RenderFrameWithAudio(frameIDX, renderFrameOnly = false)
{
    if (isNaN(frameIDX)) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[frameIDX], 0, 0, canvas.width, canvas.height);
    if(!renderFrameOnly) playScrubbedAudio(frameIDX / window.frameRate);

    // TODO: Validate Index against Frames! I believe we already heave targetTime available?!?!
    lastFrameIDX = frameIDX;
}

function handleScrub(event) {
    if (!isScrubbing || recordingPlaying) return;
    const rect = scrubber.getBoundingClientRect();
    const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    targetTime = Math.floor(percent * frames.length);
    if (frames[targetTime]) {
        RenderFrameWithAudio(targetTime);
        if(recordingState) RecordCurrentFrame();
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