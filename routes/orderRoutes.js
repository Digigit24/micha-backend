const express = require("express");
const {
    createOrder,
    verifyPayment,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus
} = require("../controllers/orderController");
const { authenticateUser, authenticateAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

// User Routes
/**
 * @swagger
 * /orders/create-payment:
 *   post:
 *     summary: Initiate an order and payment
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - phone
 *             properties:
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 default: Online
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                 razorpayOrder:
 *                   type: object
 *                 razorpayKeyId:
 *                   type: string
 *       400:
 *         description: Bad request (e.g. empty cart)
 *       500:
 *         description: Server error
 */
router.post("/create-payment", authenticateUser, createOrder);

/**
 * @swagger
 * /orders/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - order_id
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *               order_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Payment verified and order confirmed
 *       400:
 *         description: Payment verification failed
 *       500:
 *         description: Server error
 */
router.post("/verify-payment", authenticateUser, verifyPayment);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get logged-in user's order history
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/my-orders", authenticateUser, getMyOrders);

/**
 * @swagger
 * /orders/my-orders/{id}:
 *   get:
 *     summary: Get details of a specific order
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get("/my-orders/:id", authenticateUser, getOrderDetails);

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/admin/all", authenticateAdmin, getAllOrders);

/**
 * @swagger
 * /orders/admin/{id}:
 *   get:
 *     summary: Get order details by ID (Admin only)
 *     tags: [Orders]
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
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get("/admin/:id", authenticateAdmin, getAdminOrderDetails);

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *       500:
 *         description: Server error
 */
router.patch("/admin/:id/status", authenticateAdmin, updateOrderStatus);

module.exports = router;
