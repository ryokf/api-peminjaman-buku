import { Router } from "express";
import { getBooks } from "../controllers/book.controllers.js";

const bookRouter = Router()

bookRouter.get('/', getBooks);

export default bookRouter;