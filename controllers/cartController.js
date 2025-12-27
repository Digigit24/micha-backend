const prisma = require("../config/prisma");

const addToCart = async (req, res) => {
    try {
        const { product_id } = req.body;
        const user_id = req.user.id; // JWT payload uses 'id' not 'user_id'

        if (!product_id) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Check if item already exists in cart for this user
        const existingItem = await prisma.cart.findUnique({
            where: {
                user_id_product_id: {
                    user_id: parseInt(user_id),
                    product_id: parseInt(product_id)
                }
            }
        });

        if (existingItem) {
            // If exists, increment quantity
            const updatedItem = await prisma.cart.update({
                where: { cart_id: existingItem.cart_id },
                data: { quantity: existingItem.quantity + 1 }
            });
            return res.json({ message: "Cart updated", item: updatedItem });
        }

        // Create new item
        const newItem = await prisma.cart.create({
            data: {
                user_id: parseInt(user_id),
                product_id: parseInt(product_id),
                quantity: 1
            }
        });

        res.status(201).json({ message: "Added to cart", item: newItem });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const user_id = req.user.id; // JWT payload uses 'id'
        const cartItems = await prisma.cart.findMany({
            where: { user_id: parseInt(user_id) },
            include: {
                product: true
            }
        });
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.cart.delete({
            where: { cart_id: parseInt(id) }
        });
        res.json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1" });
        }

        const updatedItem = await prisma.cart.update({
            where: { cart_id: parseInt(id) },
            data: { quantity: parseInt(quantity) },
            include: { product: true }
        });

        res.json({ message: "Cart updated", item: updatedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCart
};
