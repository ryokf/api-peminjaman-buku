import { prisma } from "../prisma/client.js";

const getBooks = async (req, res) => {
    const books = await prisma.book.findMany();
    res.send(books);
}

export { getBooks };