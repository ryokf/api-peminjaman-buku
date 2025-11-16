import { prisma } from "../prisma/client.js";

const getBooks = async (categoryId, searchQuery) => {
    let books;

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

    return books;
}

const getDetailBook = async (id) => {
    const book = await prisma.book.findUnique({
        where: { id },
        include: {
            writer: true,
            category: true,
            loans: {
                select: {
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

    if (!book) {
        throw new Error(`Book with id ${id} not found`);
    }

    let onBorrowed = false;
    book.loans.forEach((loan) => {
        if (!loan.isDone) {
            onBorrowed = true;
        }
    });

    return {
        onBorrowed,
        ...book
    };
}

const getBooksByWriter = async (writerId) => {
    const books = await prisma.book.findMany({
        where: { writerId }
    });

    return books;
}

const createBook = async (title, description, language, photo, is_available, writer_id, category_id, owner_id) => {
    // Basic required-field validation
    if (!title || !language) {
        throw new Error("title and language are required");
    }
    if (
        writer_id === undefined ||
        category_id === undefined ||
        owner_id === undefined
    ) {
        throw new Error("writer_id, category_id, and owner_id are required");
    }

    const newBook = await prisma.book.create({
        data: {
            title,
            description,
            language,
            photo,
            isAvailable: Boolean(is_available),
            writerId: Number(writer_id),
            categoryId: Number(category_id),
            ownerId: Number(owner_id),
        },
    });

    return newBook;
}

const editBook = async (id, title, description, language, photo, is_available, writer_id, category_id, owner_id) => {
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

    return updatedBook;
}

const deleteBook = async (id) => {
    // Pertama, periksa apakah buku ada
    const book = await prisma.book.findUnique({
        where: { id },
        include: {
            loans: true,
            reservations: true
        }
    });

    if (!book) {
        throw new Error(`Book with id ${id} not found`);
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

    return deletedBook;
}

export { getBooks, getDetailBook, getBooksByWriter, createBook, editBook, deleteBook };
