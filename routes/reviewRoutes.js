const express = require("express");
const {
    createReview,
    getProductReviews,
    getAllReviews,
    deleteReview
} = require("../controllers/reviewController");
const { authenticateUser, authenticateAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review (User only)
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - rating
 *             properties:
 *               product_id:
 *                 type: integer
 *               review:
 *                 type: string
 *               rating:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Review created
 */
router.post("/", authenticateUser, createReview);

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/product/:productId", getProductReviews);

/**
 * @swagger
 * /reviews/admin:
 *   get:
 *     summary: Get all reviews (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 */
router.get("/admin", authenticateAdmin, getAllReviews);

/**
 * @swagger
 * /reviews/admin/{id}:
 *   delete:
 *     summary: Delete a review (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete("/admin/:id", authenticateAdmin, deleteReview);

module.exports = router;
