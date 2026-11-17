const CameraRepo = require("../2_persistence/cameraRepository");

exports.getCameraById = async (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid Camera ID");
    return CameraRepo.findById(id);
};

exports.createCamera = async (input) => {
    const camera = {
        user_id: input?.user_id == null ? null : Number(input.user_id),
        camera_name: input?.camera_name,
    };
    if (camera.user_id !== null && (!Number.isSafeInteger(camera.user_id) || camera.user_id <= 0)) {
        throw new Error("Invalid camera: user_id must be a positive integer");
    }
    if (typeof camera.camera_name !== "string" || !camera.camera_name.trim()) {
        throw new Error("Invalid camera: camera_name is required");
    }
    return CameraRepo.insert(camera);
};