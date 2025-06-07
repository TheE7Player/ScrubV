// Called from index.html
function TriggerReset() {
    window.dispatchEvent(new window.Event('VideoReset'));
}

// Attach any scripts that need to be reset
window.addEventListener('VideoReset', () => {
    resetScrub();
    resetAudio();
    resetPlayback();
});