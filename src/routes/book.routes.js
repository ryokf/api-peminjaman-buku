import { Router } from "express";
import { createBooks, deleteBook, editBook, getBooks } from "../controllers/book.controllers.js";

const bookRouter = Router()

bookRouter.get('/', getBooks)
bookRouter.post('/', createBooks)
bookRouter.put('/:id', editBook)
bookRouter.delete('/:id', deleteBook)

export default bookRouter;