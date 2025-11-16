import { create } from "domain";
import { prisma } from "../prisma/client.js";
import setReturnDate from "../utils/setReturnDate.js";

const getReservationsByUser = async (userId) => {
    const reservations = await prisma.reservation.findMany({
        where: { userId }
    });

    return reservations;
}

const createReservation = async (book_id, borrower_id) => {
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

    if (!book) {
        throw new Error("Book not found");
    }

    const queue = book.reservations.length + 1;

    const existingReservation = await prisma.reservation.findFirst({
        where: {
            bookId: Number(book_id),
            borrowerId: Number(borrower_id),
            status: "queue"
        }
    });

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

    return created;
}

const editReservation = async (id, status) => {
    if (status !== "done" && status !== "cancel") {
        throw new Error("Invalid status value. Must be 'done' or 'cancel'.");
    }

    const reservation = await prisma.reservation.update({
        where: {
            id: Number(id)
        }, 
        data: {
            status,
            queue: 0
        }, 
        include: {
            book: true
        }
    });

    await prisma.reservation.updateMany({
        where: {
            bookId: reservation.bookId,
            NOT: { id: reservation.id }
        }, 
        data: {
            queue: {
                decrement: 1
            }
        }
    });

    let loanData = null;

    if (status === "done") {
        await createLoan(reservation.bookId, reservation.borrowerId);
    }

    return {
        reservation,
        loan: loanData
    };
}

export { getReservationsByUser, createReservation, editReservation };
