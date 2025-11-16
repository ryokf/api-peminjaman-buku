import { Router } from "express";
import { createLoan, getLoansByUser, returnLoan } from "../controllers/loan.controllers.js";

const loanRouter = Router()

loanRouter.get('/:userId', getLoansByUser)
loanRouter.post('/', createLoan)
loanRouter.put('/:id', returnLoan)

export default loanRouter