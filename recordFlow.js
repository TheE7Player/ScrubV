// User Playback Related
let recordedFrames = [];
let recordingState = false;
let recordingPlaying = false;

// UI States
const stateElement = document.querySelector("#recordState");

const UI_States = {
    START: "Record Scrub",
    STOP: "Stop Recording",
    PLAYBACK: "Playing Back Recording..."
};

const SVG_Icons = {
    [UI_States.START]: `<circle style="stroke:#000;fill:#ef7575;stroke-width:5px" cx="128" cy="128" r="115.033"/>`,
    [UI_States.STOP]: `<rect x="12.595" y="12.227" width="230.582" height="231.343" style="stroke-width: 5px; stroke: rgb(0, 0, 0); fill: #ef7575"></rect>`,
    [UI_States.PLAYBACK]: `<path d="m253.377 87.258 110.724 214.6H142.653z" style="stroke:#000;fill:#82cc70;stroke-width:5px;transform-box:fill-box;transform-origin:50% 50%" transform="rotate(90 -26.943 -93.033)"/>`
};

function ChangeUIRecordState(State)
{
    requestIdleCallback(() => {
        stateElement.innerHTML = `<svg width="18" height="18" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">${SVG_Icons[State]}</svg>${State}`;
    });
}

function ToggleRecordState()
{
    if (!frames) return;

    recordingState = !recordingState;

    if (recordingState)
    {
        ChangeUIRecordState(UI_States.STOP);
        
        // Reset array with .length = 0 approach, instead of allocating new array
        recordedFrames.length = 0;
    }
    else
    {
        PlayBackRecording();
    }
}

function PlayBackRecording()
{ 
    if (recordedFrames.length === 0) return;

    recordingPlaying = true;
    let idx = 0, cap = recordedFrames.length;

    const startTime = performance.now();
    const startFrameTime = recordedFrames[0][1]; // First frame's recorded timestamp

    function _nextFrame(timestamp) {
        const playbackElapsed = timestamp - startTime;
        const targetTime = startFrameTime + playbackElapsed;

        while (idx < cap && recordedFrames[idx][1] <= targetTime) {
            RenderFrame(recordedFrames[idx][0]); 
            idx++;
        }

        if (idx < cap) requestAnimationFrame(_nextFrame);
        else
        {
            recordingPlaying = false;
            ChangeUIRecordState(UI_States.START);
            return;
        }
    }

    ChangeUIRecordState(UI_States.PLAYBACK);
    requestAnimationFrame(_nextFrame); // Start the loop
}

// TODO: Expand with more checks
function RecordCurrentFrame() {recordedFrames.push([lastFrameIDX, performance.now()]);}