import { getAllUsers, getUserById, editUser, toggleBlacklist, deleteUser, changeUserPassword } from "../services/user.services.js";

const getAllUsersController = async (req, res) => {
    try {
        const users = await getAllUsers();

        res.status(200).json({
            status: 200,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
}

const getUserByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await getUserById(id);

        res.status(200).json({
            status: 200,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        console.error("Get user by id error:", error);
        if (error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
}

const editUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, photo, status } = req.body;

        const updatedUser = await editUser(id, username, email, photo, status);

        res.status(200).json({
            status: 200,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Edit user error:", error);
        if (error.message.includes("already in use") || error.message.includes("Status must")) {
            return res.status(400).json({
                message: error.message
            });
        }
        res.status(500).json({
            message: "Failed to edit user",
            error: error.message
        });
    }
}

const toggleBlacklistController = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_blacklist } = req.body;

        if (is_blacklist === undefined) {
            return res.status(400).json({
                message: "is_blacklist field is required"
            });
        }

        const updatedUser = await toggleBlacklist(id, is_blacklist);

        const action = updatedUser.isBlacklist ? "blacklisted" : "whitelisted";
        res.status(200).json({
            status: 200,
            message: `User successfully ${action}`,
            data: updatedUser
        });
    } catch (error) {
        console.error("Toggle blacklist error:", error);
        if (error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }
        res.status(500).json({
            message: "Failed to toggle blacklist",
            error: error.message
        });
    }
}

const deleteUserController = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await deleteUser(id);

        res.status(200).json({
            status: 200,
            message: "User deleted successfully",
            data: {
                id: deletedUser.id,
                username: deletedUser.username,
                email: deletedUser.email
            }
        });
    } catch (error) {
        console.error("Delete user error:", error);
        if (error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }
        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
}

const changeUserPasswordController = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                message: "current_password and new_password are required"
            });
        }

        const updatedUser = await changeUserPassword(id, current_password, new_password);

        res.status(200).json({
            status: 200,
            message: "Password changed successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Change password error:", error);
        if (error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }
        if (error.message.includes("incorrect")) {
            return res.status(401).json({
                message: error.message
            });
        }
        res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
}

export { getAllUsersController, getUserByIdController, editUserController, toggleBlacklistController, deleteUserController, changeUserPasswordController };
