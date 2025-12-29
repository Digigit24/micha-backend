const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const messageRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
// ... imports ...
const app = express();

const cors = require("cors");
app.use(cors({
    origin: true, // Use request origin
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors()); // Enable pre-flight for all routes (using regex to avoid path-to-regexp error)


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} | Origin: ${req.headers.origin}`);
    next();
});

// ... routes ...

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use('/uploads', express.static('uploads')); // Serve uploaded files

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", messageRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", require("./routes/orderRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 404 Handler for debugging
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found" });
});

// Force Server Restart v8 - Route Refresh
