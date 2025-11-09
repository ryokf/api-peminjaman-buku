import { Router } from "express";
import { createBooks, deleteBook, editBook, getBooks, getDetailBook } from "../controllers/book.controllers.js";
import authorize from "../middleware/auth.middleware.js";

const bookRouter = Router()

bookRouter.get('/', authorize, getBooks)
bookRouter.get('/:id', authorize, getDetailBook)
bookRouter.post('/', authorize, createBooks)
bookRouter.put('/:id', authorize, editBook)
bookRouter.delete('/:id', authorize, deleteBook)

export default bookRouter;