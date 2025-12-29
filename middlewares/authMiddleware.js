const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
    try {
        const token = req.cookies.admin_token;
        console.log("Cookies received:", req.cookies); // Debug log

        if (!token) {
            console.log("Token missing in request");
            return res.status(401).json({ message: "No authentication token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret_key");
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const authenticateUser = (req, res, next) => {
    try {
        let token = req.cookies.token;

        // Fallback to Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret_key");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = { authenticateAdmin, authenticateUser };
