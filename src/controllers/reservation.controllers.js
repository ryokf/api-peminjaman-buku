import { getReservationsByUser as getReservationsByUserService, createReservation as createReservationService, editReservation as editReservationService } from "../services/reservation.services.js";

const getReservationsByUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        const reservations = await getReservationsByUserService(userId);

        res.status(200).json({
            status: 200,
            message: "Reservations fetched successfully",
            data: reservations
        });
    } catch (e) {
        console.error("Get reservations error:", e);
        res.status(500).json({
            message: "Failed to fetch reservations", 
            error: e.message
        });
    }
}

const createReservation = async (req, res) => {
    try {
        const { book_id, borrower_id } = req.body;

        const created = await createReservationService(book_id, borrower_id);

        return res.status(201).json({
            status: 201,
            message: "Reservation created successfully",
            data: created,
        });
    } catch (e) {
        console.error("Create reservation error:", e);
        if (e.message && e.message.includes("active reservation")) {
            return res.status(409).json({ message: e.message });
        }
        return res.status(500).json({
            message: "Failed to create reservation",
            error: e.message,
        });
    }
}

const editReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await editReservationService(id, status);

        if (status === "done") {
            return res.status(200).json({
                status: 200,
                message: "Reservation done and loan created successfully",
                data: {
                    reservation: result.reservation,
                    loan: result.loan
                }
            });
        } else {
            return res.status(200).json({
                status: 200,
                message: "Reservation canceled successfully",
                data: result.reservation
            });
        }
    } catch (e) {
        console.error("Edit reservation error:", e);
        if (e.message && e.message.includes("Invalid status")) {
            return res.status(400).json({
                message: e.message
            });
        }
        res.status(500).json({
            message: "Failed to edit reservation", 
            error: e.message
        });
    }
}

export {
    getReservationsByUser,
    createReservation,
    editReservation
};