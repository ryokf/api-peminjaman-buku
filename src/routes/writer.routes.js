import express, { Router } from "express";
import { createWriter, deleteWriter, editWriter, getWriters, } from "../controllers/writer.controllers.js";

const writerRouter = Router()

writerRouter.get('/', getWriters)
writerRouter.post('/', createWriter)
writerRouter.put('/:id', editWriter)
writerRouter.delete('/:id', deleteWriter)

export default writerRouter;