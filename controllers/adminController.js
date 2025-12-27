const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const createAdmin = async (req, res) => {
    try {
        const { admin_name, admin_email, admin_password } = req.body;

        const admin = await prisma.admin.create({
            data: {
                admin_name,
                admin_email,
                admin_password
            }
        });

        res.status(201).json({
            message: "Admin created successfully",
            admin
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAdmins = async (req, res) => {
    try {
        const admins = await prisma.admin.findMany();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { admin_email, admin_password } = req.body;

        const admin = await prisma.admin.findUnique({
            where: {
                admin_email: admin_email
            }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        if (admin.admin_password !== admin_password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin.admin_id, email: admin.admin_email },
            process.env.JWT_SECRET || "my_super_secret_key",
            { expiresIn: "24h" }
        );

        // Set Cookie
        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: false, // Set to true in production (https)
            sameSite: "Lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            message: "Login successful",
            admin
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createAdmin,
    getAdmins,
    loginAdmin
};
