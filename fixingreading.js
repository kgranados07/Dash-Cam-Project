const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { Jimp } = require('jimp');
const jsQR = require('jsqr');

// ---- CONFIG: your webcam's exact device name (found via list-webcams.js) ----
const WEBCAM_DEVICE_NAME = 'Integrated Camera';

const tempImagePath = './tempframe.jpg';

// ---- CONFIG: map each QR code's text content to the violation it represents. ----
// When you generate your QR codes, encode exactly these strings as the QR content
// (any free QR generator works - just type this text in as the "data").
const CODE_TO_EVENT = {
  'speeding': { zoneId: 1, violationType: 'speeding' },
  'stop_sign': { zoneId: 2, violationType: 'stop_sign_violation' },
  'parking': { zoneId: 3, violationType: 'parking_violation' },
  'collision': { zoneId: 4, violationType: 'collision' },
};

const API_BASE_URL = 'http://localhost:3000';
const CAPTURE_INTERVAL_MS = 500;

// Cooldown so a code sitting in frame for multiple loop cycles doesn't
// fire a new ticket every 500ms while the car passes it. Tune this
// alongside your event_hash de-dupe on the server.
const RESIGHT_COOLDOWN_MS = 3000;
const lastReportedAt = {}; // code text -> timestamp

// Grab a single frame from the webcam using ffmpeg (DirectShow on Windows)
// and save it to tempImagePath.
function captureFrame() {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        '-f', 'dshow',
        '-i', `video=${WEBCAM_DEVICE_NAME}`,
        '-frames:v', '1',
        '-y',
        tempImagePath,
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Decode the captured JPEG into raw RGBA pixels and scan for a QR code.
async function scanFrame(imagePath) {
  const image = await Jimp.read(imagePath);
  const { data, width, height } = image.bitmap;
  return jsQR(new Uint8ClampedArray(data), width, height);
}

async function reportTicket(ticket) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    const result = await res.json();
    console.log('Ticket created:', result);
  } catch (err) {
    console.error('Failed to report ticket:', err.message);
  }
}

async function handleCode(codeText) {
  const event = CODE_TO_EVENT[codeText];
  if (!event) {
    console.log(`Scanned unrecognized code: "${codeText}"`);
    return;
  }

  const now = Date.now();
  const lastSeen = lastReportedAt[codeText] || 0;
  if (now - lastSeen < RESIGHT_COOLDOWN_MS) return; // still in cooldown
  lastReportedAt[codeText] = now;

  await reportTicket({
    zoneId: event.zoneId,
    violationType: event.violationType,
    speed: null,
    evidencePath: tempImagePath,
    eventHash: `${event.violationType}-${now}`,
  });
}

async function detectionLoop() {
  try {
    await captureFrame();
    const result = await scanFrame(tempImagePath);

    if (result) {
      await handleCode(result.data);
    }
  } catch (err) {
    console.error('Detection loop error:', err.message);
  }
}

console.log('Starting QR detection loop... (Ctrl+C to stop)');
setInterval(detectionLoop, CAPTURE_INTERVAL_MS);