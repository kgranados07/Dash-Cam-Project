const NodeWebcam = require('node-webcam');
const sharp = require('sharp');
const { AprilTag, FAMILIES } = require('@monumental-works/apriltag-node');

// New Detector
const detector = new AprilTag(FAMILIES.TAG36H11);

// Cam settings
const webcamOptions = {
    width: 640,
    height: 480,
    quality: 80,
    output: "jpeg",
    callbackReturn: "location",
    verbose: false
};

// WebCam Instance
const Webcam = NodeWebcam.create(webcamOptions);
const tempImagePath = './tempframe.jpg';

// ---- CONFIG: map each printed AprilTag ID to the violation it represents. ----
// Update the IDs to match whatever tag36h11 numbers you actually print.
const TAG_TO_EVENT = {
  0: { zoneId: 1, violationType: 'speeding' },          // school zone tag
  1: { zoneId: 2, violationType: 'stop_sign_violation' },
  2: { zoneId: 3, violationType: 'parking_violation' },
  3: { zoneId: 4, violationType: 'collision' },
};

const API_BASE_URL = 'http://localhost:3000';
const CAPTURE_INTERVAL_MS = 500;

// Cooldown so a tag sitting in frame for multiple loop cycles doesn't
// fire a new ticket every 500ms while the car passes it. Tune this
// alongside your event_hash de-dupe on the server.
const RESIGHT_COOLDOWN_MS = 3000;
const lastReportedAt = {}; // tagId -> timestamp

function captureFrame() {
  return new Promise((resolve, reject) => {
    Webcam.capture(tempImagePath, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

// Convert the captured JPEG to raw grayscale pixels for the detector.
async function preprocessFrame(imagePath) {
  const { data, info } = await sharp(imagePath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
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

async function handleDetection(tagId) {
  const event = TAG_TO_EVENT[tagId];
  if (!event) return; // unrecognized tag ID, ignore

  const now = Date.now();
  const lastSeen = lastReportedAt[tagId] || 0;
  if (now - lastSeen < RESIGHT_COOLDOWN_MS) return; // still in cooldown
  lastReportedAt[tagId] = now;

  await reportTicket({
    zoneId: event.zoneId,
    violationType: event.violationType,
    speed: null,
    evidencePath: tempImagePath,
    eventHash: `${event.violationType}-${tagId}-${now}`,
  });
}

async function detectionLoop() {
  try {
    await captureFrame();
    const { data, width, height } = await preprocessFrame(tempImagePath);
    const detections = detector.detect(data, width, height);

    for (const tag of detections) {
      await handleDetection(tag.id);
    }
  } catch (err) {
    console.error('Detection loop error:', err.message);
  }
}

setInterval(detectionLoop, CAPTURE_INTERVAL_MS);