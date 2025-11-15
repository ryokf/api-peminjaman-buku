import { prisma } from "../prisma/client.js";
import setReturnDate from "../utils/setReturnDate.js";

const getReservationsByUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const reservations = await prisma.reservation.findMany({
            where: { userId }
        });

        res.status(200).json({
            status: 200,
            message: "Reservations fetched successfully",
            data: reservations
        });
    } catch (e) {
        res.status(500).json({
            message: "Failed to fetch reservations", error: e.message
        });
    }
}

const createReservation = async (req, res) => {
    try {
        const { book_id, borrower_id } = req.body;

        const book = await prisma.book.findUnique({
            where: { id: book_id },
            select: {
                id: true,
                reservations: {
                    where: {
                        status: "queue"
                    }
                }
            },
        });

        const queue = book.reservations.length + 1;

        const existingReservation = await prisma.reservation.findFirst({
            where: {
                bookId: Number(book_id),
                borrowerId: Number(borrower_id),
                status: "queue"
            }
        })

        if (existingReservation) {
            throw new Error("User already has an active reservation for this book");
        }

        const created = await prisma.reservation.create({
            data: {
                bookId: Number(book_id),
                borrowerId: Number(borrower_id),
                queue,
                status: "queue"
            },
        });

        return res.status(201).json({
            status: 201,
            message: "Reservation created successfully",
            data: created,
        });
    } catch (e) {
        if (e.message && e.message.includes("active reservation")) {
            return res.status(409).json({ message: e.message });
        }
        return res.status(500).json({
            message: "Failed to create reservation",
            error: e.message,
        });
    }
}

const editReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if(status !== "done" && status !== "cancel") {
            return res.status(400).json({
                message: "Invalid status value. Must be 'done' or 'cancel'."
            });
        }

        const reservation = await prisma.reservation.update({
            where: {
                id: Number(id)
            }, data: {
                status,
                queue: 0
            }, include: {
                book: true
            }
        })

        await prisma.reservation.updateMany({
            where: {
                bookId: reservation.bookId,
                NOT: { id: reservation.id }
            }, data: {
                queue: {
                    decrement: 1
                }
            }
        })

        if (status === "done") {
            try {
                const loanData = {
                    bookId: reservation.bookId,
                    borrowerId: reservation.borrowerId,
                    isDone: false,
                    isLate: false,
                    isDamaged: false,
                    photo: ""
                };

                const { bookId,
                    borrowerId,
                    isDone = false,
                    isLate = false,
                    isDamaged = false,
                    photo = ""
                } = loanData;

                // Required fields
                if (bookId === undefined || borrowerId === undefined) {
                    return res.status(400).json({
                        message: "book_id and borrower_id are required"
                    });
                }

                const borrowDate = new Date()
                const loan = await prisma.loan.create({
                    data: {
                        bookId: Number(bookId),
                        borrowerId: Number(borrowerId),
                        returnDate: new Date(setReturnDate(borrowDate)),
                        isDone: Boolean(isDone),
                        isLate: Boolean(isLate),
                        isDamaged: Boolean(isDamaged),
                        photo
                    },
                });

                return res.status(201).json({
                    status: 201,
                    message: "Reservation done and loan created successfully",
                    data: loan,
                });
            } catch (error) {
                return res.status(500).json({ message: "Internal server error", error: error.message });
            }
        } else {
            res.status(200).json({
                status: 200,
                message: "Reservation canceled successfully",
                data: reservation
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Failed to edit reservation", error: e.message
        });
    }
}

export {
    getReservationsByUser,
    createReservation,
    editReservation
};