const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Micha API Documentation",
            version: "1.0.0",
            description: "API documentation for Micha backend",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server",
            },
            {
                url: "https://your-render-url.onrender.com",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "admin_token",
                },
            },
        },
    },
    apis: ["./routes/*.js"], // where swagger comments are written
};

module.exports = swaggerJsdoc(options);

