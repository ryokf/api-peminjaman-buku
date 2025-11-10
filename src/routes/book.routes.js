import { Router } from "express";
import { createBooks, deleteBook, editBook, getBooks, getDetailBook } from "../controllers/book.controllers.js";
import authorize from "../middleware/auth.middleware.js";

const bookRouter = Router()

bookRouter.get('/', getBooks)
bookRouter.get('/:id', getDetailBook)
bookRouter.post('/', createBooks)
bookRouter.put('/:id', editBook)
bookRouter.delete('/:id', deleteBook)

export default bookRouter;