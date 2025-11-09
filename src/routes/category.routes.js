import { Router } from "express";
import { createCategory, deleteCategory, editCategory, getCategories } from "../controllers/category.controllers.js";

const categoryRouter = Router()

categoryRouter.get('/', getCategories)
categoryRouter.post('/', createCategory)
categoryRouter.put('/:id', editCategory)
categoryRouter.delete('/:id', deleteCategory)

export default categoryRouter;