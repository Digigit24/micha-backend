const express = require("express");
const { createAdmin, getAdmins, loginAdmin, verifyAdmin } = require("../controllers/adminController");
const { authenticateAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - admin_name
 *         - admin_email
 *         - admin_password
 *       properties:
 *         admin_id:
 *           type: integer
 *           description: The auto-generated id of the admin
 *         admin_name:
 *           type: string
 *           description: The name of the admin
 *         admin_email:
 *           type: string
 *           description: The email of the admin
 *         admin_password:
 *           type: string
 *           description: The password of the admin
 *     LoginRequest:
 *       type: object
 *       required:
 *         - admin_email
 *         - admin_password
 *       properties:
 *         admin_email:
 *           type: string
 *         admin_password:
 *           type: string
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: The admin was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Bad request
 */
router.get("/ping", (req, res) => res.send("pong"));

/**
 * @swagger
 * /admin/verify:
 *   get:
 *     summary: Verify admin session
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Authenticated
 *       401:
 *         description: Unauthorized
 */
router.get("/verify", authenticateAdmin, verifyAdmin);

router.post("/", createAdmin);

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: The list of the admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 */
router.get("/", getAdmins);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login for admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: admin_token=abcde12345; Path=/; HttpOnly
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Admin not found
 */
router.post("/login", loginAdmin);

module.exports = router;
