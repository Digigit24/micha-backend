const prisma = require("../config/prisma");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

// Create Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// User: Create Order
const createOrder = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { address, phone, payment_method } = req.body;

        // Fetch User and Cart
        const user = await prisma.user.findUnique({
            where: { user_id: parseInt(user_id) },
            include: {
                cart: {
                    include: { product: true }
                }
            }
        });

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Calculate Total
        let total = 0;
        const orderItemsData = user.cart.map(item => {
            const itemTotal = item.product.product_discount * item.quantity;
            total += itemTotal;
            return {
                product_id: item.product_id,
                product_name: item.product.product_title,
                price: item.product.product_discount,
                quantity: item.quantity
            };
        });

        // Use transaction to create DB order first (Pending)
        // Actually, we need to create Razorpay order first to get the ORDER_ID 
        // OR we create DB order -> get ID -> Create Razorpay Order -> Update DB Order with Razorpay ID (if needed)
        // But Razorpay Order ID is different from our DB ID. 
        // We will return both to frontend.

        // Create DB Order
        const dbOrder = await prisma.order.create({
            data: {
                user_id: user.user_id,
                total_amount: total,
                address: address || user.address,
                phone: phone || user.phone,
                payment_method: payment_method || "Online",
                payment_status: "PENDING",
                order_status: "PLACED",
                order_items: {
                    create: orderItemsData
                }
            }
        });

        // Create Razorpay Order if payment method is not COD (assuming online for now)
        let razorpayOrder = null;
        if (payment_method !== 'COD') {
            const options = {
                amount: Math.round(total * 100), // amount in lowest currency unit (paise)
                currency: "USD", // Example: Use INR if in India. User didn't specify, defaulting to USD or maybe INR?
                // Given the currency in previous steps was $, let's keep USD. Razorpay supports international.
                // NOTE: Razorpay is primarily Indian, default is INR usually. Let's assume INR for Razorpay context or convert.
                // Wait, if frontend shows $, and we send to Razorpay, we should ensure currency matches account.
                // Assuming USD for now based on "$" sign in HTML.
                receipt: `order_rcptid_${dbOrder.order_id}`
            };
            try {
                razorpayOrder = await razorpay.orders.create(options);
            } catch (rzpError) {
                console.error("Razorpay Error:", rzpError);
                // Rollback or just return error (dbOrder stays PENDING/FAILED?)
                await prisma.order.delete({ where: { order_id: dbOrder.order_id } });
                return res.status(500).json({ error: "Failed to create payment order" });
            }
        }

        res.status(201).json({
            message: "Order created successfully",
            order: dbOrder,
            razorpayOrder,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// User: Verify Payment
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id // Our DB order ID
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update Order Status
            await prisma.order.update({
                where: { order_id: parseInt(order_id) },
                data: {
                    payment_status: "SUCCESS",
                    order_status: "CONFIRMED"
                }
            });

            // Clear Cart
            await prisma.cart.deleteMany({
                where: { user_id: req.user.id }
            });

            res.json({ message: "Payment verified and order confirmed" });
        } else {
            // Update to Failed
            await prisma.order.update({
                where: { order_id: parseInt(order_id) },
                data: {
                    payment_status: "FAILED"
                }
            });
            res.status(400).json({ error: "Payment verification failed" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User: Get My Orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { user_id: req.user.id },
            include: { order_items: true },
            orderBy: { order_date: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User: Get Order Details
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findFirst({
            where: {
                order_id: parseInt(id),
                user_id: req.user.id
            },
            include: { order_items: true } // Could also include product details
        });

        if (!order) return res.status(404).json({ error: "Order not found" });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Get All Orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { username: true, email: true } },
                order_items: true
            },
            orderBy: { order_date: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Get Order by ID
const getAdminOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { order_id: parseInt(id) },
            include: {
                user: { select: { username: true, email: true, phone: true } },
                order_items: true
            }
        });
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update Status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. "SHIPPED"

        const order = await prisma.order.update({
            where: { order_id: parseInt(id) },
            data: { order_status: status }
        });
        res.json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus
};
