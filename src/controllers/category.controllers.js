import { getCategories as getCategoriesService, createCategory as createCategoryService, editCategory as editCategoryService, deleteCategory as deleteCategoryService } from "../services/category.services.js";

const getCategories = async (req, res) => {
    try {
        const categories = await getCategoriesService();

        res.status(200).json({
            status: 200,
            message: "Categories fetched successfully",
            data: categories
        });
    } catch (e) {
        console.error("Get categories error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to fetch categories" 
        });
    }
}

const createCategory = async (req, res) => {
    try {
        const category = await createCategoryService(req.body);

        res.status(201).json({
            status: 201,
            message: "Category created successfully",
            data: category
        });
    } catch (e) {
        console.error("Create category error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to create category" 
        });
    }
}

const editCategory = async (req, res) => {
    try {
        const category = await editCategoryService(req.params.id, req.body);

        res.status(200).json({
            status: 200,
            message: "Category updated successfully",
            data: category
        });
    } catch (e) {
        console.error("Edit category error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to edit category" 
        });
    }
}

const deleteCategory = async (req, res) => {
    try {
        await deleteCategoryService(req.params.id);

        res.status(200).json({ 
            status: 200,
            message: "Category deleted successfully" 
        });
    } catch (e) {
        console.error("Delete category error:", e);
        res.status(500).json({ 
            error: e.message, 
            message: "Failed to delete category" 
        });
    }
}

export { getCategories, createCategory, editCategory, deleteCategory };