import { prisma } from "../prisma/client.js";
import setReturnDate from "../utils/setReturnDate.js";
import { editReservation } from "./reservation.services.js";

const getLoansByUser = async (borrowerId) => {
    const loans = await prisma.loan.findMany({
        where: { borrowerId },
        include: {
            book: {
                include: {
                    writer: true,
                    category: true
                }
            }
        }
    });

    return loans;
}

const createLoan = async (book_id, borrower_id, is_done, is_late, is_damaged, photo) => {
    const book = await prisma.book.findUnique({
        where: { id: Number(book_id) },
        select: {
            isAvailable: true
        }
    });

    if (!book || !book.isAvailable) {
        throw new Error("Book is not available for loan");
    }

    const borrower = await prisma.user.findUnique({
        where: { id: Number(borrower_id) },
        select: {
            isBlacklist: true,
            id: true
        }
    });

    if (borrower.isBlacklist) {
        throw new Error("Your account is blacklisted and cannot borrow books, please contact the library staff");
    }

    // Opsional: Cek batas maksimum peminjaman
    const activeLoans = await prisma.loan.count({
        where: { borrowerId: borrower.id, isDone: false }
    });
    if (activeLoans >= 2) { // Asumsi batas 3 buku
        throw new Error("You have reached maximum borrow limit");
    }

    // Required fields
    if (book_id === undefined || borrower_id === undefined) {
        throw new Error("book_id and borrower_id are required");
    }

    const borrowDate = new Date();
    const [loan, _] = await prisma.$transaction([
        prisma.loan.create({
            data: {
                bookId: Number(book_id),
                borrowerId: Number(borrower_id),
                returnDate: new Date(setReturnDate(borrowDate)),
                isDone: Boolean(is_done),
                isLate: Boolean(is_late),
                isDamaged: Boolean(is_damaged),
                photo
            },
        }),
        prisma.book.update({
            where: { id: Number(book_id) },
            data: { isAvailable: false }
        })
    ]);

    return loan;
}

const returnLoan = async (id, isDamaged) => {
    const loanData = await prisma.loan.findUnique({
        where: { id },
        select: {
            returnDate: true
        }
    });

    if (!loanData) {
        throw new Error("Loan not found");
    }

    let isLate = false;
    const currentDate = new Date();
    if (currentDate > loanData.returnDate) {
        isLate = true;
    }

    const [loan, _] = await prisma.$transaction([
        prisma.loan.update({
            where: { id },
            data: {
                isDone: true,
                isDamaged: Boolean(isDamaged),
                isLate
            },
        }),
        prisma.book.update({
            where: { id: loanData.bookId },
            data: { isAvailable: true }
        })
    ]);

    const nextInQueue = await prisma.reservation.findFirst({
        where: {
            bookId: loan.bookId,
            status: "queue"
        },
        orderBy: {
            queue: 'asc'
        },
        select: {
            id: true,
        }
    });

    if (nextInQueue) {
        await editReservation(nextInQueue?.id, "done");
    } 

    return {
        status: 201,
        message: "Book returned successfully",
        data: loan
    };
}

export { getLoansByUser, createLoan, returnLoan };
