import { prisma } from "../prisma/client.js";
import bcrypt from "bcryptjs";

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            photo: true,
            status: true,
            isBlacklist: true,
            ownedBooks: {
                select: {
                    id: true,
                    title: true
                }
            },
            loans: {
                select: {
                    id: true,
                    isDone: true
                }
            },
            reservations: {
                select: {
                    id: true,
                    status: true
                }
            }
        }
    });

    return users;
}

const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            username: true,
            email: true,
            photo: true,
            status: true,
            isBlacklist: true,
            ownedBooks: {
                select: {
                    id: true,
                    title: true
                }
            },
            loans: {
                select: {
                    id: true,
                    bookId: true,
                    isDone: true,
                    returnDate: true
                }
            },
            reservations: {
                select: {
                    id: true,
                    bookId: true,
                    status: true
                }
            }
        }
    });

    if (!user) {
        throw new Error(`User with id ${id} not found`);
    }

    return user;
}

const editUser = async (id, username, email, photo, status) => {
    // Validate status
    if (status && !["staff", "member"].includes(status)) {
        throw new Error("Status must be either 'staff' or 'member'");
    }

    // Check if username or email already exists (for other users)
    if (username || email) {
        const existing = await prisma.user.findFirst({
            where: {
                AND: [
                    { NOT: { id: Number(id) } },
                    {
                        OR: [
                            { username: username || undefined },
                            { email: email || undefined }
                        ]
                    }
                ]
            }
        });

        if (existing) {
            const field = existing.username === username ? "username" : "email";
            throw new Error(`${field} already in use by another user`);
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
            username: username || undefined,
            email: email || undefined,
            photo: photo || undefined,
            status: status || undefined
        },
        select: {
            id: true,
            username: true,
            email: true,
            photo: true,
            status: true,
            isBlacklist: true
        }
    });

    return updatedUser;
}

const toggleBlacklist = async (id, isBlacklist) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    });

    if (!user) {
        throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
            isBlacklist: Boolean(isBlacklist)
        },
        select: {
            id: true,
            username: true,
            email: true,
            photo: true,
            status: true,
            isBlacklist: true
        }
    });

    return updatedUser;
}

const deleteUser = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
            loans: true,
            reservations: true,
            ownedBooks: true
        }
    });

    if (!user) {
        throw new Error(`User with id ${id} not found`);
    }

    // Delete all related data in transaction
    const deletedUser = await prisma.$transaction(async (tx) => {
        // Delete reservations
        if (user.reservations.length > 0) {
            await tx.reservation.deleteMany({
                where: { borrowerId: Number(id) }
            });
        }

        // Delete loans
        if (user.loans.length > 0) {
            await tx.loan.deleteMany({
                where: { borrowerId: Number(id) }
            });
        }

        // Delete owned books
        if (user.ownedBooks.length > 0) {
            await tx.book.deleteMany({
                where: { ownerId: Number(id) }
            });
        }

        // Finally delete user
        return await tx.user.delete({
            where: { id: Number(id) }
        });
    });

    return deletedUser;
}



export { getAllUsers, getUserById, editUser, toggleBlacklist, deleteUser };
