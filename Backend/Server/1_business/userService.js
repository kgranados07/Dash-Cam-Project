const UserRepo = require("../2_persistence/userRepository");

exports.getUserById = async (id) => {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid User ID");
    return UserRepo.findById(id);
};

exports.createUser = async (input) => {
    const user = {
        username: input?.username,
        password: input?.password,
    };
    if (typeof user.username !== "string" || !user.username.trim()) {
        throw new Error("Invalid user: username is required");
    }
    if (typeof user.password !== "string" || !user.password) {
        throw new Error("Invalid user: password is required");
    }
    return UserRepo.insert(user);
};