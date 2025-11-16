import { prisma } from "../prisma/client.js";

const getCategories = async () => {
    const categories = await prisma.category.findMany();
    return categories;
}

const createCategory = async (data) => {
    const category = await prisma.category.create({
        data
    });
    return category;
}

const editCategory = async (id, data) => {
    const category = await prisma.category.update({
        where: { id: Number(id) },
        data
    });
    return category;
}

const deleteCategory = async (id) => {
    await prisma.category.delete({
        where: { id: Number(id) }
    });
}

export { getCategories, createCategory, editCategory, deleteCategory };
