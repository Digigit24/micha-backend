const express = require("express");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

// All cart routes require user authentication
router.use(authenticateUser);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Added to cart
 */
router.post("/", addToCart);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of cart items
 */
router.get("/", getCart);

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
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
 *         description: Removed from cart
 */
router.delete("/:id", removeFromCart);

/**
 * @swagger
 * /cart/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 */
router.put("/:id", require("../controllers/cartController").updateCart);

module.exports = router;
