import { prisma } from "../prisma/client.js";

const getBooks = async (req, res) => {
    let books;

    const categoryId = Number(req.query.category_id);
    const searchQuery = req.query.search;

    if (categoryId) {
        books = await prisma.book.findMany({
            where: { categoryId }
        });
    } else if (searchQuery) {
        books = await prisma.book.findMany({
            where: {
                title: {
                    contains: searchQuery,
                    mode: "insensitive"
                }
            }
        });
    } else {
        books = await prisma.book.findMany();
    }
    res.status(200).json({
        status: 200,
        message: "books fetched successfully",
        data: books
    });
}

const getDetailBook = async (req, res) => {
    const id = Number(req.params.id);
    const book = await prisma.book.findUnique({
        where: { id },
        include: {
            writer: true,
            category: true,
            loans: {
                select:{
                    isDone: true
                }
            },
            reservations: {
                where: {
                    status: "queue"
                }
            }
        }
    });

    let onBorrowed = false
    book.loans.forEach((loan) => {
        if (!loan.isDone) {
            onBorrowed = true
        }
    });

    res.status(200).json({
        status: 200,
        message: "",
        data: {
            onBorrowed,
            ...book
        }
    });
}

const getBooksByWriter = async (req, res) => {
    const writerId = Number(req.params.writerId);
    const books = await prisma.book.findMany({
        where: { writerId }
    });
    res.send(books);
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

        // Basic required-field validation
        if (!title || !language) {
            return res.status(400).json({ message: "title and language are required" });
        }
        if (
            writer_id === undefined ||
            category_id === undefined ||
            owner_id === undefined
        ) {
            return res.status(400).json({
                message: "writer_id, category_id, and owner_id are required",
            });
        }

        const newBook = await prisma.book.create({
            data: {
                title,
                description,
                language,
                photo,
                isAvailable: Boolean(is_available),
                // Ensure numeric FK values
                writerId: Number(writer_id),
                categoryId: Number(category_id),
                ownerId: Number(owner_id),
            },
        });

        return res.status(201).json(newBook);
    } catch (err) {
        console.error("Create book error:", err);
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

        const updatedBook = await prisma.book.update({
            where: { id },
            data: {
                title,
                description,
                language,
                photo,
                isAvailable: is_available !== undefined ? Boolean(is_available) : undefined,
                writerId: writer_id !== undefined ? Number(writer_id) : undefined,
                categoryId: category_id !== undefined ? Number(category_id) : undefined,
                ownerId: owner_id !== undefined ? Number(owner_id) : undefined,
            },
        });

        return res.status(200).json(updatedBook);
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

        // Pertama, periksa apakah buku ada
        const book = await prisma.book.findUnique({
            where: { id },
            include: {
                loans: true,
                reservations: true
            }
        });

        if (!book) {
            return res.status(404).json({
                message: `Book with id ${ id } not found`
            });
        }

        // Gunakan transaksi untuk menghapus semua data terkait dan buku dalam satu operasi atomic
        const deletedBook = await prisma.$transaction(async (tx) => {
            // Hapus semua reservations terkait
            if (book.reservations.length > 0) {
                await tx.reservation.deleteMany({
                    where: { bookId: id }
                });
            }

            // Hapus semua loans terkait
            if (book.loans.length > 0) {
                await tx.loan.deleteMany({
                    where: { bookId: id }
                });
            }

            // Akhirnya hapus buku
            return await tx.book.delete({
                where: { id }
            });
        });

        return res.status(200).json({
            status: 200,
            message: `Book with id ${ id } and all related records successfully deleted`,
            data: deletedBook
        });
    } catch (err) {
        console.error("Delete book error:", err);
        return res.status(500).json({
            message: "Failed to delete book",
            error: err.message
        });
    }
}

export { getBooks, createBooks, editBook, deleteBook, getBooksByWriter, getDetailBook };