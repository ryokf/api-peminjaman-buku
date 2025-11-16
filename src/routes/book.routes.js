import { Router } from "express";
import { createBooks, deleteBook, editBook, getBooks, getDetailBook } from "../controllers/book.controllers.js";
import authorize from "../middleware/auth.middleware.js";
import checkRole from '../middleware/checkRole.middleware.js';

const bookRouter = Router()

bookRouter.get('/', getBooks)
bookRouter.get('/:id', getDetailBook)
bookRouter.post('/', checkRole(['staff']), createBooks)
bookRouter.put('/:id', checkRole(['staff']), editBook)
bookRouter.delete('/:id', checkRole(['staff']), deleteBook)

export default bookRouter;