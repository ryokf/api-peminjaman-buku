import { prisma } from "../prisma/client";

const getCategories = async (req, res) => {
    const categories = await prisma.category.findMany();
    res.send(categories);
}

const createCategory = async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.create({
        data: {
            name,
        },
    });
    res.status(201).send(category);
};

const editCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({
        where: { id: Number(id) },
        data: { name },
    });
    res.send(category);
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    await prisma.category.delete({
        where: { id: Number(id) },
    });
    res.status(204).send();
};

export { getCategories, createCategory, editCategory, deleteCategory };