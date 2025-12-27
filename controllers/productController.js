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
                images: {
                    create: product_images.map(url => ({ image_url: url }))
                },
                product_tag,
                category_id: parseInt(category_id)
            },
            include: { images: true }
        });

        // Format response to match old structure if needed or keep new structure
        // Let's flatten for frontend compatibility: product_image: [urls]
        const formattedProduct = {
            ...product,
            product_image: product.images.map(img => img.image_url)
        };

        res.status(201).json(formattedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                images: true
            }
        });

        // Transform to include product_image array for frontend compatibility
        const formattedProducts = products.map(product => ({
            ...product,
            product_image: product.images.map(img => img.image_url)
        }));

        res.status(200).json(formattedProducts);
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

        // For simplicity in this update, we often replace all images if new are provided
        // Or we append. Let's assume replace if new images provided, else keep.
        // Prisma update with relation:
        const updateData = {
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
            const newImages = req.files.map(file => file.location);
            // Delete old images and add new ones (Transaction or deleteMany then create)
            // Ideally should delete from S3 too, but for now just DB logic
            updateData.images = {
                deleteMany: {},
                create: newImages.map(url => ({ image_url: url }))
            };
        }

        const product = await prisma.product.update({
            where: { product_id: parseInt(id) },
            data: updateData,
            include: { images: true }
        });

        const formattedProduct = {
            ...product,
            product_image: product.images.map(img => img.image_url)
        };

        res.json(formattedProduct);
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
                category: true,
                images: true
            }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found for this category" });
        }

        const formattedProducts = products.map(product => ({
            ...product,
            product_image: product.images.map(img => img.image_url)
        }));

        res.json(formattedProducts);
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
