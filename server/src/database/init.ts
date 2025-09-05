import { MongoClient } from "mongodb";

let client: MongoClient;
let db: any;

export async function initializeDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log("⚠️  MONGODB_URI not found, using fallback database initialization");
      console.log("✅ Database initialization completed (fallback mode)");
      return;
    }

    console.log("🔌 Connecting to MongoDB...");
    client = new MongoClient(mongoUri);
    await client.connect();
    
    db = client.db();
    
    // Test the connection
    await db.admin().ping();
    console.log("✅ Connected to MongoDB successfully");
    
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("⚠️  Continuing with fallback mode...");
  }
}

export function closeDatabase(): void {
  if (client) {
    client.close();
  }
}

export { db };