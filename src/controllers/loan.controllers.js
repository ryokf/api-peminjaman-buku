import { getLoansByUser as getLoansByUserService, createLoan as createLoanService, returnLoan as returnLoanService } from "../services/loan.services.js";

const getLoansByUser = async (req, res) => {
    try {
        const borrowerId = Number(req.user.id);
        const loans = await getLoansByUserService(borrowerId);

        res.status(200).json({
            status: 200,
            message: "Loans fetched successfully",
            data: loans
        });
    } catch (err) {
        console.error("Get loans error:", err);
        return res.status(500).json({
            message: "Failed to fetch loans",
            error: err.message,
        });
    }
}

const createLoan = async (req, res) => {
    try {
        const {
            book_id,
            is_done = false,
            is_late = false,
            is_damaged = false,
            photo
        } = req.body;

        const user = req.user;

        const loan = await createLoanService(book_id, user.id, is_done, is_late, is_damaged, photo);

        return res.status(201).json({
            status: 201,
            message: "Loan created successfully",
            data: loan
        });
    } catch (error) {
        console.error("Create loan error:", error);
        if (error.message && (error.message.includes("not available") || error.message.includes("blacklisted") || error.message.includes("maximum"))) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
}

const returnLoan = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { isDamaged } = req.body;

        const loan = await returnLoanService(id, isDamaged);

        res.status(200).json({
            status: 200,
            message: "Book returned successfully",
            data: loan
        });
    } catch (error) {
        console.error("Return book error:", error);
        if (error.message && error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }
        res.status(500).json({
            status: 500,
            message: "Failed to return book",
            error: error.message
        });
    }
}

export { getLoansByUser, createLoan, returnLoan };