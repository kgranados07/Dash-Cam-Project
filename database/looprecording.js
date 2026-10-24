// loopRecording.js
// Starts continuous loop recording: records fixed-length video segments on a
// cycle, overwriting old footage once all slots have been used (FR-01, FR-02).
// Uses the recordSegment() function already defined in db.js.

const path = require('path');
const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { initDb, recordSegment } = require('./db');

const WEBCAM_DEVICE_NAME = 'Integrated Camera'; // same as fixingreading.js
const SEGMENT_SECONDS = 30; // how long each loop-recording chunk is
const LOOP_SLOTS = 10; // matches LOOP_SEGMENT_COUNT in db.js
const SEGMENTS_DIR = path.join(__dirname, 'segments');

let currentSlot = 0;

// Records one fixed-length clip to segments/segment_<slot>.mp4,
// overwriting whatever was already in that slot.
function captureSegment(slot) {
  const filePath = path.join(SEGMENTS_DIR, `segment_${slot}.mp4`);

  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        '-f', 'dshow',
        '-i', `video=${WEBCAM_DEVICE_NAME}`,
        '-t', String(SEGMENT_SECONDS),
        '-y', // overwrite the existing file for this slot
        filePath,
      ],
      (err) => {
        if (err) return reject(err);
        resolve(filePath);
      }
    );
  });
}

async function recordNextSegment() {
  const startTs = Date.now();
  const slot = currentSlot;

  try {
    const filePath = await captureSegment(slot);
    const endTs = Date.now();

    // This is the "tracking" step: write/overwrite the DB row for this slot.
    await recordSegment({ filePath, startTs, endTs, slotIndex: slot });

    console.log(`Segment ${slot} recorded: ${filePath}`);
  } catch (err) {
    console.error(`Failed to record segment ${slot}:`, err.message);
  }

  currentSlot = (slot + 1) % LOOP_SLOTS;
}

async function startLoopRecording() {
  await initDb();
  console.log('Starting loop recording...');

  // Kick off the first segment immediately, then keep going back-to-back.
  // (Not setInterval, so a slow segment doesn't overlap the next capture.)
  while (true) {
    await recordNextSegment();
  }
}

startLoopRecording();