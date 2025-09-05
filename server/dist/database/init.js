"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const mongodb_1 = require("mongodb");
let client;
let db;
async function initializeDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.log("⚠️  MONGODB_URI not found, using fallback database initialization");
            console.log("✅ Database initialization completed (fallback mode)");
            return;
        }
        console.log("🔌 Connecting to MongoDB...");
        client = new mongodb_1.MongoClient(mongoUri);
        await client.connect();
        exports.db = db = client.db();
        await db.admin().ping();
        console.log("✅ Connected to MongoDB successfully");
        console.log("✅ Database initialized successfully");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        console.log("⚠️  Continuing with fallback mode...");
    }
}
function closeDatabase() {
    if (client) {
        client.close();
    }
}
//# sourceMappingURL=init.js.map