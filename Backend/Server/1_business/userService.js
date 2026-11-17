const UserRepo = require("../2_persistence/userRepository");

exports.getUserById = async (id) => {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid User ID");
    return UserRepo.findById(id);
};