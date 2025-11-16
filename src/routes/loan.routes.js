import { Router } from "express";
import { createLoan, getLoansByUser, returnLoan } from "../controllers/loan.controllers.js";
import checkRole from "../middleware/checkRole.middleware.js";

const loanRouter = Router()

loanRouter.get('/', getLoansByUser)
loanRouter.post('/', createLoan)
loanRouter.put('/:id', checkRole(['staff']), returnLoan)

export default loanRouter