import { Router } from "express";
import { createLoan } from "../controllers/loan.controllers.js";

const loanRouter = Router()

loanRouter.post('/', createLoan)

export default loanRouter