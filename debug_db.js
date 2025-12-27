const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Testing Database Connection and Queries...");

    try {
        console.log("Fetching Categories...");
        const categories = await prisma.category.findMany();
        console.log("Categories found:", categories.length);
        console.log(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
    }

    try {
        console.log("Fetching Products...");
        const products = await prisma.product.findMany({
            include: { category: true }
        });
        console.log("Products found:", products.length);
        console.log(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

main()
    .catch(e => {
        console.error("Main script error:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
