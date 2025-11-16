import { Router } from "express";
import { createCategory, deleteCategory, editCategory, getCategories } from "../controllers/category.controllers.js";
import checkRole from "../middleware/checkRole.middleware.js";

const categoryRouter = Router()

categoryRouter.get('/', getCategories)
categoryRouter.post('/', checkRole(['staff']), createCategory)
categoryRouter.put('/:id', checkRole(['staff']), editCategory)
categoryRouter.delete('/:id', checkRole(['staff']), deleteCategory)

export default categoryRouter;