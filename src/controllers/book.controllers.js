import { getBooks as getBooksService, getDetailBook as getDetailBookService, getBooksByWriter as getBooksByWriterService, createBook, editBook as editBookService, deleteBook as deleteBookService } from "../services/book.services.js";

const getBooks = async (req, res) => {
    try {
        const categoryId = Number(req.query.category_id);
        const searchQuery = req.query.search;

        const books = await getBooksService(categoryId, searchQuery);

        res.status(200).json({
            status: 200,
            message: "books fetched successfully",
            data: books
        });
    } catch (err) {
        console.error("Get books error:", err);
        return res.status(500).json({
            message: "Failed to fetch books",
            error: err.message,
        });
    }
}

const getDetailBook = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const book = await getDetailBookService(id);

        res.status(200).json({
            status: 200,
            message: "Book detail fetched successfully",
            data: book
        });
    } catch (err) {
        console.error("Get detail book error:", err);
        if (err.message.includes("not found")) {
            return res.status(404).json({
                message: err.message
            });
        }
        return res.status(500).json({
            message: "Failed to fetch book detail",
            error: err.message,
        });
    }
}

const getBooksByWriter = async (req, res) => {
    try {
        const writerId = Number(req.params.writerId);

        const books = await getBooksByWriterService(writerId);

        res.status(200).json({
            status: 200,
            message: "Books by writer fetched successfully",
            data: books
        });
    } catch (err) {
        console.error("Get books by writer error:", err);
        return res.status(500).json({
            message: "Failed to fetch books by writer",
            error: err.message,
        });
    }
}

const createBooks = async (req, res) => {
    try {
        const {
            title,
            description,
            language,
            photo,
            is_available = true,
            writer_id,
            category_id,
            owner_id,
        } = req.body;

        const newBook = await createBook(title, description, language, photo, is_available, writer_id, category_id, owner_id);

        return res.status(201).json(newBook);
    } catch (err) {
        console.error("Create book error:", err);
        if (err.message && err.message.includes("required")) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({
            message: "Failed to create book",
            error: err.message,
        });
    }
}

const editBook = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            title,
            description,
            language,
            photo,
            is_available,
            writer_id,
            category_id,
            owner_id,
        } = req.body;

        const updatedBook = await editBookService(id, title, description, language, photo, is_available, writer_id, category_id, owner_id);

        return res.status(200).json({
            status: 200,
            message: "Book updated successfully",
            data: updatedBook
        });
    } catch (err) {
        console.error("Edit book error:", err);
        return res.status(500).json({
            message: "Failed to edit book",
            error: err.message,
        });
    }
}

const deleteBook = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const deletedBook = await deleteBookService(id);

        return res.status(200).json({
            status: 200,
            message: `Book with id ${id} and all related records successfully deleted`,
            data: deletedBook
        });
    } catch (err) {
        console.error("Delete book error:", err);
        if (err.message && err.message.includes("not found")) {
            return res.status(404).json({
                message: err.message
            });
        }
        return res.status(500).json({
            message: "Failed to delete book",
            error: err.message
        });
    }
}

export { getBooks, createBooks, editBook, deleteBook, getBooksByWriter, getDetailBook };