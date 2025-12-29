const express = require("express");
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
    origin: true, // Allow any origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Server restart trigger v6
