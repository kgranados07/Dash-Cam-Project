const UserService = require("../1_business/userService");

exports.getUser = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const user = await UserService.getUserById(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
    } catch (err) {
        console.error("GET user error:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};