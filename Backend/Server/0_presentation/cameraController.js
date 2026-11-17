const CameraService = require("../1_business/cameraService");

exports.getCamera = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const camera = await CameraService.getCameraById(id);
        if (!camera) return res.status(404).json({ message: "Camera not found" });
        return res.json(camera);
    } catch (err) {
        console.error("GET camera error:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.postCamera = async (req, res) => {
    try {
        const camera = await CameraService.createCamera(req.body);
        return res.status(201).json(camera);
    } catch (err) {
        if (err.message.startsWith("Invalid camera:")) {
            return res.status(400).json({ message: err.message });
        }
        console.error("POST camera error:", err.message);
        return res.status(500).json({ message: "Could not save camera" });
    }
};