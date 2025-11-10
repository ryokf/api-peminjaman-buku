const getReservationsByUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const reservations = await prisma.reservation.findMany({
            where: { userId }
        });

        res.status(200).json({
            status: 200,
            message: "Reservations fetched successfully",
            data: reservations
        });
    } catch (e) {
        res.status(500).json({
            message: "Failed to fetch reservations", error: e.message
        });
    }
}

const createReservation = async (req, res) => {
    try {
        const { book_id, borrower_id, queue, status } = req.body;

        if (book_id === undefined || borrower_id === undefined) {
            return res.status(400).json({
                message: "book_id and borrower_id are required"
            });
        }

        const allowedStatus = ["cancel", "done", "queue"];
        const finalStatus = allowedStatus.includes(status) ? status : "queue";

        const created = await prisma.$transaction(async (tx) => {
            // Prevent duplicate active queue for same user & book
            const existingActive = await tx.reservation.findFirst({
                where: {
                    book_id: Number(book_id),
                    borrower_id: Number(borrower_id),
                    status: "queue",
                },
                select: { id: true },
            });
            if (existingActive) {
                throw new Error("User already has an active reservation (queue) for this book");
            }

            // Compute queue if not provided: next highest position for this book
            let nextQueue;
            if (queue !== undefined) {
                nextQueue = Number(queue);
            } else {
                const last = await tx.reservation.findFirst({
                    where: { book_id: Number(book_id), status: "queue" },
                    orderBy: { queue: "desc" },
                    select: { queue: true },
                });
                nextQueue = (last?.queue ?? 0) + 1;
            }

            return tx.reservation.create({
                data: {
                    book_id: Number(book_id),
                    borrower_id: Number(borrower_id),
                    queue: nextQueue,
                    status: finalStatus,
                },
            });
        });

        return res.status(201).json({
            status: 201,
            message: "Reservation created successfully",
            data: created,
        });
    } catch (e) {
        if (e.message && e.message.includes("active reservation")) {
            return res.status(409).json({ message: e.message });
        }
        return res.status(500).json({
            message: "Failed to create reservation",
            error: e.message,
        });
    }
}

export {
    getReservationsByUser,
    createReservation
};