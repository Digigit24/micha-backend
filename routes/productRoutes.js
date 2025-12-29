const express = require("express");
const { createProduct, getProducts, updateProduct, deleteProduct, getProductsByCategoryName, getPublicProducts, getPublicProductById } = require("../controllers/productController");
const { authenticateAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - product_title
 *         - product_mrp
 *         - product_discount
 *       properties:
 *         product_id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         product_title:
 *           type: string
 *           description: The title of the product
 *         product_description:
 *           type: string
 *           description: The description of the product
 *         product_mrp:
 *           type: number
 *           format: float
 *           description: The MRP of the product
 *         product_discount:
 *           type: number
 *           format: float
 *           description: The discounted price
 *         product_discount_per:
 *           type: number
 *           format: float
 *           description: The discount percentage
 *         product_feature:
 *           type: string
 *           description: Key features
 *         product_available:
 *           type: boolean
 *           description: Availability status
 *         product_image:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs of the product images
 *         product_tag:
 *           type: string
 *           description: Product tag
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_title:
 *                 type: string
 *               product_description:
 *                 type: string
 *               product_mrp:
 *                 type: number
 *               product_discount:
 *                 type: number
 *               product_feature:
 *                 type: string
 *               product_available:
 *                 type: boolean
 *               product_image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               product_tag:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateAdmin, upload.array('product_image', 10), createProduct); // Admin only

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", authenticateAdmin, getProducts); // Admin only
router.get("/public", getPublicProducts); // Public access
router.get("/public/:id", getPublicProductById); // Public access single product

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
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
 *               product_title:
 *                 type: string
 *               product_description:
 *                 type: string
 *               product_mrp:
 *                 type: number
 *               product_discount:
 *                 type: number
 *               product_feature:
 *                 type: string
 *               product_available:
 *                 type: boolean
 *               product_image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               product_tag:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", authenticateAdmin, upload.array('product_image', 10), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
router.delete("/:id", authenticateAdmin, deleteProduct);

/**
 * @swagger
 * /products/category/{categoryName}:
 *   get:
 *     summary: Get products by category name
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the category to filter products by (case-insensitive)
 *     responses:
 *       200:
 *         description: List of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: No products found for this category
 */
router.get("/category/:categoryName", getProductsByCategoryName);

module.exports = router;
