const Audio_Buffer = 0.015; // Play only 15ms

let videoContainsAudio = false; // Holds flag if an audio stream is present to be played by the browser

let audioContext; // Holds the audio-processing functionality from the browser.
let audioBuffer; // Holds the audio buffer.
let audioSource; // Main controller to host the sound (store, play, stop).

// Method which will initialise the audio for the scrubbing (If any (Audio stream))
function extractAudio(file) {
    // Create the file reader object
    const reader = new FileReader();

    try {
        // Insert the file as an array buffer
        reader.readAsArrayBuffer(file);

        // Load the context and buffer for audio processing (If any)
        reader.onload = async () => {
            // Create the context window
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Initialise the audio data of the video
            audioBuffer = await audioContext.decodeAudioData(reader.result);

            videoContainsAudio = true;
        };
    } catch (error) {
        // TODO: Show message to user, console
        videoContainsAudio = false;
    }
}

// Method will allow us to play a segment of audio while user scrubs (If any)
function playScrubbedAudio(time) {
    // TODO: Validate if audio option can allow user to toggle sound

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

// Stops the audio from continuing (If any)
function stopScrubbedAudio() {
    if (audioSource) {
        audioSource.stop();
        audioSource = null;
    }
}

// Resets the audio parameters for the next video
function resetAudio()
{
    stopScrubbedAudio(); // Stop & Clear audioSource
    
    videoContainsAudio = false; // Reset Flag
    
    // TODO: Couldn't this not be preserved instead of clearing/assigned each video?
    audioContext = null; // Clear the audio context object

    // TODO: Evaluate if this initial deference is viable
    
    if(!audioBuffer) return;
    audioBuffer.buffer = null; // Clear the initial audio buffer
    audioBuffer = null; // Clear the audio buffer object
}
