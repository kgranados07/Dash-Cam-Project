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

console.log(Webcam)
