import express, { Router } from "express";
import { createWriter, deleteWriter, editWriter, getWriters, } from "../controllers/writer.controllers.js";
import checkRole from "../middleware/checkRole.middleware.js";

const writerRouter = Router()

writerRouter.get('/', getWriters)
writerRouter.post('/', checkRole(['staff']), createWriter)
writerRouter.put('/:id', checkRole(['staff']), editWriter)
writerRouter.delete('/:id', checkRole(['staff']), deleteWriter)

export default writerRouter;