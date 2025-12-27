const express = require("express");


const { createUser, getUsers, loginUser, getUserProfile } = require("../controllers/userController");
const { authenticateAdmin, authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object  
 *       required:
 *         - username
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         address:
 *           type: string
 *           description: The user's address
 *         pincode:
 *           type: string
 *           description: The user's pincode
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was added
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Some error happened
 */
router.post("/", createUser); // Public registration

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get logged in user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticateUser, getUserProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateAdmin, getUsers); // Admin only

module.exports = router;
