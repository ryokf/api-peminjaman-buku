import {prisma} from "../prisma/client.js";

const getWriters = async (req, res) => {
    try{
        const writers = await prisma.writer.findMany()

        res.status(200).json(writers);
    }catch (e){
        res.status(500).json({ error: e.message, message: "Failed to fetch writers" });
    }
}

const createWriter = async (req, res) => {
    try {
        const newWriter = await prisma.writer.create({
            data: req.body
        });
        res.status(201).json(newWriter);
    } catch (e) {
        res.status(500).json({ error: e.message, message: "Failed to create writer" });
    }
}

const editWriter = async (req, res) => {
    try {
        const updatedWriter = await prisma.writer.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json(updatedWriter);
    } catch (e) {
        res.status(500).json({ error: e.message, message: "Failed to edit writer" });
    }
}

const deleteWriter = async (req, res) => {
    try {
        await prisma.writer.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ message: "Writer deleted successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message, message: "Failed to delete writer" });
    }
}

export {
    getWriters,
    createWriter,
    editWriter,
    deleteWriter
};