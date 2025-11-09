import { Router } from "express";
import { createLoan, getLoansByUser, returnBook } from "../controllers/loan.controllers.js";

const loanRouter = Router()

loanRouter.get('/:userId', getLoansByUser)
loanRouter.post('/', createLoan)
loanRouter.put('/:id', returnBook)

export default loanRouter