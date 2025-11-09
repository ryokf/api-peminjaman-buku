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
        const loan = await prisma.loan.create({
            data: {
                bookId: Number(book_id),
                borrowerId: Number(borrower_id),
                returnDate: new Date(setReturnDate(borrowDate)),
                isDone: Boolean(is_done),
                isLate: Boolean(is_late),
                isDamaged: Boolean(is_damaged),
                photo
            },
        });

        return res.status(201).json(loan);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const returnBook = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { isDamaged, isLate } = req.body

        const loan = await prisma.loan.update({
            where: { id },
            data: {
                isDone: true,
                isDamaged,
                isLate
            }
        })

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