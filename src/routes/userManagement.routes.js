import { Router } from "express";
import { getAllUsersController, getUserByIdController, editUserController, toggleBlacklistController, deleteUserController} from "../controllers/user.controllers.js";
import checkRole from "../middleware/checkRole.middleware.js";

const userManagementRouter = Router();

// All routes require staff role
userManagementRouter.use(checkRole(['staff']));

// Get all users
userManagementRouter.get('/', getAllUsersController);

// Get user by id
userManagementRouter.get('/:id', getUserByIdController);

// Edit user
userManagementRouter.put('/:id', editUserController);

// Toggle blacklist
userManagementRouter.patch('/:id/blacklist', toggleBlacklistController);

// Delete user
userManagementRouter.delete('/:id', deleteUserController);



export default userManagementRouter;

