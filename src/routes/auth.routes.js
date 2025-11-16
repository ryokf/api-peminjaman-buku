import { Router } from "express";
import { login, register, logout } from "../controllers/auth.controllers.js";
import authorize from "../middleware/auth.middleware.js";

const authRouter = Router()

authRouter.post('/login', login)
authRouter.post('/register', register)
authRouter.post('/logout', authorize, logout)

export default authRouter;