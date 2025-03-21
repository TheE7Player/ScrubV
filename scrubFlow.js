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

videoInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    beginScrubProcess(file);
});

window.ResetToMainMenu = function() {
    frames = [];			
    stopScrubbedAudio();
    if (audioContext) {
        audioContext.close();
        audioContext = null;
        
    }
    window.CurrentVideoTitle = "";
    videoContainer.style.display = 'none';

    // Reset User Data
    recordedFrames = [];
    audioTimestamps = [];
    lastFrameIDX = 0;
    recordingState = false;

    document.querySelector("#videoReset").style.visibility = "hidden";
    document.querySelector("#videoName").innerText = "Buffering Video... Please Wait";
    document.querySelector("#MainMenu").style.display = 'flex';
};

window.CurrentVideoTitle = "";
window.beginScrubProcess = function (file)
{
    if (file) {
        window.CurrentVideoTitle = file.name;
        console.log(`[beginScrubProcess] Processing file: ${file.name}`)

        // document.querySelector(".file-drag-drop").style.display = 'none';
        document.querySelector("#MainMenu").style.display = 'none';
        document.querySelector(".file-drag-drop").classList.remove('highlight');
    
        frames = [];
        
        stopScrubbedAudio();
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        
        const url = URL.createObjectURL(file);
        video.src = url;
        video.preload = "auto";
        video.onloadeddata = extractFrames;
        videoContainer.style.display = 'flex';
        extractAudio(file);
    }
}

function extractFrames() {
    overlay.style.visibility = 'visible';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let duration = video.duration;
    let totalFrames = Math.floor(duration * window.frameRate);
    frames = new Array(totalFrames);

    async function captureAllFrames() {
        for (let i = 0; i < totalFrames; i++) {
            await new Promise((resolve) => {
                video.currentTime = (i / window.frameRate);
                video.onseeked = () => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames[i] = canvas.toDataURL();
                    resolve();
                };
            });
        }
        video.style.display = 'none';
        overlay.style.visibility = 'hidden';
        document.querySelector("#videoName").innerText = window.CurrentVideoTitle;
        document.querySelector("#videoReset").style.visibility = "visible";
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

function playScrubbedAudio(time) {
    if (audioContext && audioBuffer) {
        if (audioSource) {
            audioSource.stop();
        }
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);
        audioSource.start(0, time, 0.015); // Play only 15ms
    }
}

function stopScrubbedAudio() {
    if (audioSource) {
        audioSource.stop();
        audioSource = null;
    }
}

function RenderFrameWithAudio(frameIDX)
{
    if (isNaN(frameIDX)) return;

    const audioNum = frameIDX / window.frameRate;
    let img = new Image();
    img.src = frames[frameIDX];
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    playScrubbedAudio(audioNum);
    
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
document.addEventListener('mousemove', (event) => handleScrub(event));
document.addEventListener('mouseup', stopScrubbing);

scrubber.addEventListener('touchstart', (event) => startScrubbing(event.touches[0]));
document.addEventListener('touchmove', (event) => handleScrub(event.touches[0]));
document.addEventListener('touchend', stopScrubbing);