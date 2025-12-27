const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
    try {
        const { username, email, phone, password, address, pincode } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                phone,
                password: hashedPassword,
                address,
                pincode
            }
        });

        res.status(201).json({
            message: "User created successfully",
            user
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`Login failed: Invalid password for user ${user.email}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(`Login successful for user ${user.email}. Generating token...`);
        // Generate Token
        const token = jwt.sign(
            { id: user.user_id, email: user.email },
            process.env.JWT_SECRET || "my_super_secret_key",
            { expiresIn: "24h" }
        );

        // Set Cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevents JS access, good for security
            secure: false, // Set to true if using HTTPS
            sameSite: "Lax", // Allows the cookie to be sent on top-level navigations
            path: "/",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            message: "Login successful",
            // Token removed from body to enforce cookie usage
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From middleware

        const user = await prisma.user.findUnique({
            where: {
                user_id: userId
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    loginUser,
    getUserProfile
};
