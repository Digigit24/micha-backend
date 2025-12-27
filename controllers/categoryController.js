const prisma = require("../config/prisma");

const createCategory = async (req, res) => {
    try {
        const { category_name, category_description, active } = req.body;
        let iconPath = req.body.icon; // Fallback or text input

        if (req.file) {
            iconPath = req.file.location;
        }

        const isActive = active === 'true' || active === true || active === 'on';

        const category = await prisma.category.create({
            data: {
                category_name,
                category_description,
                icon: iconPath,
                active: isActive
            }
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { category_name, category_description, active } = req.body;

        let dataToUpdate = {
            category_name,
            category_description,
            active: active === 'true' || active === true || active === 'on'
        };

        if (req.file) {
            dataToUpdate.icon = req.file.location;
        }

        const updatedCategory = await prisma.category.update({
            where: { category_id: parseInt(id) },
            data: dataToUpdate
        });
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.category.delete({
            where: { category_id: parseInt(id) }
        });
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Cannot delete category because it has associated products. Please delete the products first." });
        }
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
