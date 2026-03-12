import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../.env" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sainandhini";

async function createIndexes() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;

        // Product indexes
        console.log("Creating Product indexes...");
        await db.collection('products').createIndex({ category: 1 });
        await db.collection('products').createIndex({ isActive: 1 });
        await db.collection('products').createIndex({ stock: 1 });
        await db.collection('products').createIndex({ isFeatured: 1 });
        await db.collection('products').createIndex({ createdAt: -1 });
        await db.collection('products').createIndex({ category: 1, isActive: 1 });
        await db.collection('products').createIndex({ isActive: 1, stock: 1 });
        await db.collection('products').createIndex({ category: 1, isActive: 1, stock: 1 });

        // Order indexes
        console.log("Creating Order indexes...");
        await db.collection('orders').createIndex({ user: 1 });
        await db.collection('orders').createIndex({ status: 1 });
        await db.collection('orders').createIndex({ isPaid: 1 });
        await db.collection('orders').createIndex({ isDelivered: 1 });
        await db.collection('orders').createIndex({ createdAt: -1 });
        await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
        await db.collection('orders').createIndex({ status: 1, createdAt: -1 });
        await db.collection('orders').createIndex({ isPaid: 1, createdAt: -1 });
        await db.collection('orders').createIndex({ "orderItems.product": 1 });

        // User indexes
        console.log("Creating User indexes...");
        await db.collection('user').createIndex({ role: 1 });
        await db.collection('user').createIndex({ phone: 1 });
        await db.collection('user').createIndex({ createdAt: -1 });
        await db.collection('user').createIndex({ role: 1, createdAt: -1 });

        // Review indexes
        console.log("Creating Review indexes...");
        await db.collection('reviews').createIndex({ product: 1 });
        await db.collection('reviews').createIndex({ user: 1 });
        await db.collection('reviews').createIndex({ isApproved: 1 });
        await db.collection('reviews').createIndex({ product: 1, isApproved: 1 });
        await db.collection('reviews').createIndex({ user: 1, product: 1 });
        await db.collection('reviews').createIndex({ createdAt: -1 });

        // Category indexes
        console.log("Creating Category indexes...");
        await db.collection('categories').createIndex({ isActive: 1 });
        await db.collection('categories').createIndex({ order: 1 });
        await db.collection('categories').createIndex({ isActive: 1, order: 1 });

        console.log("✅ All indexes created successfully!");
        
        // List all indexes for verification
        console.log("\n📋 Index Summary:");
        const collections = ['products', 'orders', 'user', 'reviews', 'categories'];
        
        for (const collectionName of collections) {
            const indexes = await db.collection(collectionName).indexes();
            console.log(`\n${collectionName}:`);
            indexes.forEach(index => {
                const keys = Object.keys(index.key).map(k => `${k}: ${index.key[k]}`).join(', ');
                console.log(`  - { ${keys} }`);
            });
        }

    } catch (error) {
        console.error("❌ Error creating indexes:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
        process.exit(0);
    }
}

createIndexes();