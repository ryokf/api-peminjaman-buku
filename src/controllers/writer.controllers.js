import { getWriters as getWritersService, createWriter as createWriterService, editWriter as editWriterService, deleteWriter as deleteWriterService } from "../services/writer.services.js";

const getWriters = async (req, res) => {
    try {
        const writers = await getWritersService();

        res.status(200).json({
            status: 200,
            message: "Writers fetched successfully",
            data: writers
        });
    } catch (e) {
        console.error("Get writers error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to fetch writers" 
        });
    }
}

const createWriter = async (req, res) => {
    try {
        const newWriter = await createWriterService(req.body);

        res.status(201).json({
            status: 201,
            message: "Writer created successfully",
            data: newWriter
        });
    } catch (e) {
        console.error("Create writer error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to create writer" 
        });
    }
}

const editWriter = async (req, res) => {
    try {
        const updatedWriter = await editWriterService(req.params.id, req.body);

        res.status(200).json({
            status: 200,
            message: "Writer updated successfully",
            data: updatedWriter
        });
    } catch (e) {
        console.error("Edit writer error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to edit writer" 
        });
    }
}

const deleteWriter = async (req, res) => {
    try {
        await deleteWriterService(req.params.id);

        res.status(200).json({ 
            status: 200,
            message: "Writer deleted successfully" 
        });
    } catch (e) {
        console.error("Delete writer error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to delete writer" 
        });
    }
}

export {
    getWriters,
    createWriter,
    editWriter,
    deleteWriter
};