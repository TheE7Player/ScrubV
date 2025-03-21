// User Playback Related
let recordedFrames = [];
let recordingState = false;
let recordingPlaying = false;

// UI States
const stateElement = document.querySelector("#recordState");

const UI_StartRecording = "Record Scrub";
const UI_StopRecording = "Stop Recording";
const UI_PlayingBack = "Playing Back Recording...";

const SVG_RecordLogo = `<circle style="stroke:#000;fill:#ef7575;stroke-width:5px" cx="128" cy="128" r="115.033"/>`;
const SVG_StopLogo = `<rect x="12.595" y="12.227" width="230.582" height="231.343" style="stroke-width: 5px; stroke: rgb(0, 0, 0); fill: #ef7575"></rect>`
const SVG_PlayLogo = `<path d="m253.377 87.258 110.724 214.6H142.653z" bx:shape="triangle 142.653 87.258 221.448 214.6 0.5 0 1@2a5925b6" style="stroke:#000;fill:#82cc70;stroke-width:5px;transform-box:fill-box;transform-origin:50% 50%" transform="rotate(90 -26.943 -93.033)"/>`;

function ChangeUIRecordState(State)
{
    const svgLogo = State === UI_StartRecording ? SVG_RecordLogo : 
                    State === UI_StopRecording ? SVG_StopLogo : SVG_PlayLogo;

    stateElement.innerHTML = `<svg width="18" height="18" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">${svgLogo}</svg>${State}`;
}

function ToggleRecordState()
{
    if (!frames) return;

    recordingState = !recordingState;

    if (recordingState)
    {
        ChangeUIRecordState(UI_StopRecording);
        if (recordedFrames.length > 0)
        {
            recordedFrames = []
        }
    }
    else
    {
        PlayBackRecording();
    }
}

function PlayBackRecording()
{ 
    recordingPlaying = true;
    let idx = 0;
    const cap = recordedFrames.length;
    if (cap === 0) return;

    const startTime = performance.now();
    const startFrameTime = recordedFrames[0][1]; // First frame's recorded timestamp

    function _nextF(timestamp) {
        if (idx >= cap) return; // Stop when all frames are played

        // Compute playback time relative to the first recorded frame
        const playbackElapsed = timestamp - startTime; // Time since playback started
        const targetTime = startFrameTime + playbackElapsed;

        // Render all frames that should have been displayed by now
        while (idx < cap && recordedFrames[idx][1] <= targetTime) {
            RenderFrameWithAudio(recordedFrames[idx][0]); // Play frame by index
            idx++;
        }

        if (idx < cap) requestAnimationFrame(_nextF); // Continue playback
        else { recordingPlaying = false; ChangeUIRecordState(UI_StartRecording); }
    }

    ChangeUIRecordState(UI_PlayingBack);
    
    requestAnimationFrame(_nextF); // Start the loop
}

// TODO: Expand with more checks
function RecordCurrentFrame() {recordedFrames.push([lastFrameIDX, performance.now()]);}