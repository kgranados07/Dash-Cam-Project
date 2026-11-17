const CameraRepo = require("../2_persistence/cameraRepository");

exports.getCameraById = async (id) => {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid Camera ID");
    return CameraRepo.findById(id);
};