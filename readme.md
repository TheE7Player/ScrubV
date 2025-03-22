# ScrubV - Video Scrubber

> ScrubV is a Work In Progress (WIP) tool. Please be aware that any issues will not be fixed suitably - progress will be slow.

### 

### Finally, an online tool where you can make funny scrub edits with videos - no phones required anymore!

You can run this on any browser offline, just download the files from this project - and click on the `index.html` - and you're good to go!

> Please ensure it is a video the browser can support, like an mp4 file.

--- 

## Features

- Ability to choose what scrubbing framerate you wish to play with: 15fps, 30fps or 60fps!
  
  - Do note the higher the frame rate, the longer the buffer (but better results!)

- Ability to reset and apply another video without needing to refresh the page

- Ability to record your scrubbing and playback in real time.
  
  - Do note, currently, it records, plays it back and then stops. You can programmatically invoke the recording again by typing the following into `DevTools`: `PlayBackRecording()`

> Do note: Currently, the scrubbing bar will not function correctly if you zoom in/out the page - so please ensure zoom is kept to 100% during usage.

---

## Current Feature Milestone

☑ Completed basic functionalities (No fault proofing yet implemented)

☐ Implement the ability for the user toggle audio mute

☐ Implement the ability for users to see/change keyframes

☐ Implement ability for user to attach a mp3/wav file to scrub against

☐ Implement the ability to use the browsers `MediaStream`, and `MediaRecorder` API - to allow the user to export their scrubbing to a video

☐ Code cleanup/revision on completion of project

---

# Project Structure

### uiFunc.js

Currently holds all the UI javascript functionalities, nothing out of the bloom. Mostly handles the drag-and-drop feature, and prevents the browser from thinking we want to open the dragged video into a new tab (by blocking the global window events).

### scrubFlow.js

The scrubbing mechanic makes the project work. Allows the video to be put into a canvas, and audio scrubbing sync when the user scrubs the video back and forth.

### recordFlow.js

Allows the ability for the user to record their scrubbing in real time. Using the browser's Performance API will allow us to bypass any framerate constraints when playing back, allowing a more realistic playback!