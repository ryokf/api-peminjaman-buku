import { da } from "@faker-js/faker";
import { prisma } from "../prisma/client.js";
import setReturnDate from "../utils/setReturnDate.js";

const getLoansByUser = async (req, res) => {
    const borrowerId = Number(req.params.userId);
    const loans = await prisma.loan.findMany({
        where: { borrowerId }
    });
    res.json(loans);
}

const createLoan = async (req, res) => {
    const book = await prisma.book.findUnique({
        where: { id: Number(req.body.book_id) },
        select: {
            isAvailable: true
        }
    });

    if (!book || !book.isAvailable) {
        return res.status(400).json({
            message: "Book is not available for loan"
        });
    }

    const borrower = await prisma.user.findUnique({
        where: { id: Number(req.body.borrower_id) },
        select: {
            isBlacklist: true
        }
    });

    if (borrower.isBlacklist) {
        return res.status(400).json({
            message: "Your account is blacklisted and cannot borrow books, please contact the library staff"
        });
    }

    // Opsional: Cek batas maksimum peminjaman
    const activeLoans = await prisma.loan.count({
        where: { borrowerId: borrower.id, isDone: false }
    });
    if (activeLoans >= 2) { // Asumsi batas 3 buku
        return res.status(400).json({ message: "You have reached maximum borrow limit" });
    }

    try {
        const {
            book_id,
            borrower_id,
            is_done = false,
            is_late = false,
            is_damaged = false,
            photo
        } = req.body;

        // Required fields
        if (book_id === undefined || borrower_id === undefined) {
            return res.status(400).json({
                message: "book_id and borrower_id are required"
            });
        }

        const borrowDate = new Date()
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

        return res.status(201).json({
            status: 201,
            message: "Loan created successfully",
            data: loan
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const returnBook = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { isDamaged } = req.body

        const loanData = await prisma.loan.findUnique({
            where: { id },
            select: {
                returnDate: true
            }
        });

        let isLate= false
        const currentDate = new Date();
        if (currentDate > loanData.returnDate) {
            isLate = true;
        }

        const [loan, _] = await prisma.$transaction([
            prisma.loan.update({
                where: { id },
                data: {
                    isDone: true,
                    isDamaged,
                    isLate
                }
            }),
            prisma.book.updateMany({
                where: {
                    loans: {
                        some: {
                            id: id
                        }
                    }
                },
                data: {
                    isAvailable: true
                }
            })
        ]);

        res.status(200).json({
            status: 200,
            message: "Book returned successfully",
            data: loan
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to return book",
            error: error.message
        });
    }
}

export { getLoansByUser, createLoan, returnBook };