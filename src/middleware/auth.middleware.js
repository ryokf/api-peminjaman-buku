import jwt from 'jsonwebtoken'

import { JWT_SECRET } from '../config/env.js'
import { prisma } from '../prisma/client.js';

const authorize = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, email: true, status: true, isBlacklist: true }
        });

        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
}

export default authorize;