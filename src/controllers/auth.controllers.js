import { loginService, registerService } from '../services/auth.services.js';

const register = async (req, res) => {
    try {
        const {
            username,
            email,
            photo = "/default-photo.png",
            password,
            status = "member",
            is_blacklist = false
        } = req.body;

        const result = await registerService(username, email, photo, password, status, is_blacklist);

        return res.status(201).json(result);
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            message: "Failed to register user",
            error: err.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const result = await loginService(username, email, password);

        return res.status(200).json(result);
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            message: "Failed to login",
            error: err.message
        });
    }
}

const logout = (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie('jwt', '', { expires: new Date(0), httpOnly: true });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const changeUserPassword = async (id, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    });

    if (!user) {
        throw new Error(`User with id ${id} not found`);
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
        throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
            password: hashedPassword
        },
        select: {
            id: true,
            username: true,
            email: true,
            status: true
        }
    });

    return updatedUser;
}

export { login, register, logout, changeUserPassword };