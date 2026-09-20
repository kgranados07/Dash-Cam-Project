// Run this once with: node list-webcams.js
// It lists every camera/audio device ffmpeg can see on Windows, so you can
// copy the exact camera name into WEBCAM_DEVICE_NAME in fixingreading.js
const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

execFile(ffmpegPath, ['-f', 'dshow', '-list_devices', 'true', '-i', 'dummy'], (err, stdout, stderr) => {
  // ffmpeg always "errors" here since -i dummy isn't a real input -
  // the device list itself prints to stderr, which is what we want.
  console.log(stderr);
});