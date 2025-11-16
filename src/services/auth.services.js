import { prisma } from "../prisma/client.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

const loginService = async (username, email, password) => {
    const loginId = username || email;

    if (!loginId || !password) {
        throw new Error("identifier (username/email) and password are required");
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: loginId }, { username: loginId }]
        }
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    // Block blacklisted users
    if (user.isBlacklist) {
        throw new Error("Your account is blacklisted, please contact support.");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        throw new Error("Invalid credentials");
    }

    const payload = { id: user.id, username: user.username, status: user.status };
    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _pw, ...safe } = user;
    return ({
        message: "Login successful",
        token,
        data: safe
    });
}

const registerService = async (username, email, photo, password, status, is_blacklist) => {
    // Basic validation
        if (!username || !email || !password) {
            throw new Error("username, email, and password are required");
        }
        if (!["staff", "member"].includes(status)) {
            throw new Error("status must be either 'staff' or 'member'"); 
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
            throw new Error("The " + taken + " is already taken");
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

        return {
            message: "User registered successfully",
            data: safe
        };
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

    // Update password in database
    await prisma.user.update({
        where: { id: Number(id) },
        data: { password: hashedPassword }
    });

    return {
        message: "Password changed successfully"
    };
}   

export { loginService, registerService, changeUserPassword };