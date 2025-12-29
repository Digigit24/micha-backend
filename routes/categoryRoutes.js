const express = require("express");
const { createCategory, getCategories, updateCategory, deleteCategory, getPublicCategories } = require("../controllers/categoryController");
const { authenticateAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - category_name
 *         - category_description
 *       properties:
 *         category_id:
 *           type: integer
 *           description: The auto-generated id of the category
 *         category_name:
 *           type: string
 *         category_description:
 *           type: string
 *         icon:
 *           type: string
 *         active:
 *           type: boolean
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *               category_description:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Error
 */
router.post("/", authenticateAdmin, upload.single('icon'), createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/", authenticateAdmin, getCategories);
router.get("/public", getPublicCategories);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *               category_description:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", authenticateAdmin, upload.single('icon'), updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Deleted successfully
 */
router.delete("/:id", authenticateAdmin, deleteCategory);

module.exports = router;
