import { Router } from "express";
import { createReservation, editReservation } from "../controllers/reservation.controllers.js";

const reservationsRouter = Router()

reservationsRouter.post('/', createReservation)
reservationsRouter.put('/:id', editReservation)

export default reservationsRouter