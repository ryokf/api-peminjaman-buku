import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client.js';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';

const register = async (req, res) => {
    try {
        const {
            username,
            email,
            photo="/default-photo.png",
            password,
            status = "member",
            is_blacklist = false
        } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "username, email, and password are required" });
        }
        if (!["staff", "member"].includes(status)) {
            return res.status(400).json({ message: "status must be either 'staff' or 'member'" });
        }

        // Uniqueness check for username or email
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            },
            select: { id: true, username: true, email: true }
        });
        if (existing) {
            const taken = existing.username === username ? "username" : "email";
            return res.status(409).json({ message: `${taken} already in use` });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        const created = await prisma.user.create({
            data: {
                username,
                email,
                photo,
                password: hashed,
                status,
                isBlacklist: Boolean(is_blacklist)
            }
        });

        // Omit password from response
        const { password: _pw, ...safe } = created;

        return res.status(201).json({
            message: "User registered successfully",
            data: safe
        });
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
        const { identifier, username, email, password } = req.body;
        // Support either a single "identifier" or explicit "username"/"email"
        const loginId = identifier || username || email;

        if (!loginId || !password) {
            return res.status(400).json({
                message: "identifier (username/email) and password are required"
            });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: loginId }, { username: loginId }]
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Block blacklisted users
        if (user.isBlacklist) {
            return res.status(403).json({ message: "Your account is blacklisted, please contact support." });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { id: user.id, username: user.username, status: user.status };
        const token = jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _pw, ...safe } = user;
        return res.status(200).json({
            message: "Login successful",
            token,
            data: safe
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            message: "Failed to login",
            error: err.message
        });
    }
}

const logout = (req, res) => {
    // Implement logout logic here
    res.status(200).json({ message: "Logout successful" });
}

export { login, register, logout };