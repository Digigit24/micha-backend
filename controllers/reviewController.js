const prisma = require("../config/prisma");

// User: Create Review
const createReview = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { product_id, review, rating } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({ error: "Product ID and rating are required" });
        }

        // Optional: Check if user purchased the product? For now, allowing any review.
        // Optional: Check if user already reviewed this product?

        const newReview = await prisma.review.create({
            data: {
                user_id: user_id,
                product_id: parseInt(product_id),
                review: review,
                rating: parseInt(rating)
            }
        });

        res.status(201).json({ message: "Review added successfully", review: newReview });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add review" });
    }
};

// Public: Get Reviews for a Product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { product_id: parseInt(productId) },
            include: {
                user: {
                    select: { username: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

// Admin: Get All Reviews
const getAllReviews = async (req, res) => {
    try {
        if (!prisma.review) {
            console.error("Prisma Review model is undefined. Checks schema generation.");
            return res.status(500).json({ error: "Server misconfiguration: Review model missing" });
        }
        const reviews = await prisma.review.findMany({
            include: {
                user: { select: { username: true, email: true } },
                product: { select: { product_title: true } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch all reviews" });
    }
};

// Admin: Delete Review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({
            where: { review_id: parseInt(id) }
        });
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete review" });
    }
};

module.exports = {
    createReview,
    getProductReviews,
    getAllReviews,
    deleteReview
};
