import { prisma } from "../prisma/client.js";

const getWriters = async () => {
    const writers = await prisma.writer.findMany();
    return writers;
}

const createWriter = async (data) => {
    const newWriter = await prisma.writer.create({
        data
    });
    return newWriter;
}

const editWriter = async (id, data) => {
    const updatedWriter = await prisma.writer.update({
        where: { id: Number(id) },
        data
    });
    return updatedWriter;
}

const deleteWriter = async (id) => {
    await prisma.writer.delete({
        where: { id: Number(id) }
    });
}

export { getWriters, createWriter, editWriter, deleteWriter };
