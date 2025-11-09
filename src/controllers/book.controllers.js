import { prisma } from "../prisma/client.js";

const getBooks = async (req, res) => {
    const books = await prisma.book.findMany();
    res.send(books);
}

const createBooks = async (req, res) => {
    console.log("Request body:", req.body);

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

export { getBooks, createBooks };