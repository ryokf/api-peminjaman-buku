import { Router } from "express";
import { createBooks, getBooks } from "../controllers/book.controllers.js";

const bookRouter = Router()

bookRouter.get('/', getBooks);
bookRouter.post('/', (req, res) => createBooks(req, res));

export default bookRouter;