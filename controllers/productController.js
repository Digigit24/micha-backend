const prisma = require("../config/prisma");

const createProduct = async (req, res) => {
    try {
        const {
            product_title,
            product_description,
            product_mrp,
            product_discount,
            product_feature,
            product_tag,
            category_id
        } = req.body;

        let product_images = [];
        if (req.files && req.files.length > 0) {
            product_images = req.files.map(file => file.location);
        } else if (req.body.product_image) {
            // Handle case where it might be a single string URL if no file uploaded
            product_images = Array.isArray(req.body.product_image) ? req.body.product_image : [req.body.product_image];
        }

        const product = await prisma.product.create({
            data: {
                product_title,
                product_description,
                product_mrp: parseFloat(product_mrp),
                product_discount: parseFloat(product_discount),
                product_discount_per: Math.round(((parseFloat(product_mrp) - parseFloat(product_discount)) / parseFloat(product_mrp)) * 100),
                product_feature,
                product_available: req.body.product_available === 'true' || req.body.product_available === 'on',
                product_image: product_images,
                product_tag,
                category_id: parseInt(category_id)
            }
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true } // Include category details
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const {
            product_title,
            product_description,
            product_mrp,
            product_discount,
            product_feature,
            product_tag,
            category_id,
            product_available
        } = req.body;

        let dataToUpdate = {
            product_title,
            product_description,
            product_mrp: parseFloat(product_mrp),
            product_discount: parseFloat(product_discount),
            product_discount_per: Math.round(((parseFloat(product_mrp) - parseFloat(product_discount)) / parseFloat(product_mrp)) * 100),
            product_feature,
            product_tag,
            category_id: parseInt(category_id),
            product_available: product_available === 'true' || product_available === 'on'
        };

        if (req.files && req.files.length > 0) {
            dataToUpdate.product_image = req.files.map(file => file.location);
        }

        const product = await prisma.product.update({
            where: { product_id: parseInt(id) },
            data: dataToUpdate
        });

        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { product_id: parseInt(id) }
        });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProductsByCategoryName = async (req, res) => {
    const { categoryName } = req.params;
    try {
        const products = await prisma.product.findMany({
            where: {
                category: {
                    category_name: {
                        equals: categoryName,
                        mode: 'insensitive' // Case-insensitive search
                    }
                }
            },
            include: {
                category: true
            }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found for this category" });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getProductsByCategoryName
};
