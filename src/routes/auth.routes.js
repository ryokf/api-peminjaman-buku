import { Router } from "express";
import { login, register, logout, changeUserPassword } from "../controllers/auth.controllers.js";
import authorize from "../middleware/auth.middleware.js";

const authRouter = Router()

authRouter.post('/login', login)
authRouter.post('/register', register)
authRouter.post('/logout', authorize, logout)
// Change user password (staff changing other user's password)
authRouter.patch('/:id/password', authorize, changeUserPassword);

export default authRouter;