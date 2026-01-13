import { Db, MongoClient } from "mongodb";

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    client = new MongoClient(uri);
    await client.connect();

    db = client.db("outswap");

    console.log("✅ Connected to MongoDB successfully");

    // Create indexes for better performance
    await createIndexes(db);

    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function createIndexes(db: Db) {
  try {
    // Geospatial index for location-based queries
    await db.collection("outfits").createIndex({
      "location.coordinates": "2dsphere",
    });

    // Text index for search
    await db.collection("outfits").createIndex({
      title: "text",
      description: "text",
      styleTags: "text",
    });

    // Common query indexes
    await db.collection("outfits").createIndex({ ownerId: 1 });
    await db.collection("outfits").createIndex({ category: 1 });
    await db.collection("outfits").createIndex({ size: 1 });
    await db.collection("outfits").createIndex({ createdAt: -1 });
    await db.collection("outfits").createIndex({ rating: -1 });

    // Rental indexes
    await db.collection("rentals").createIndex({ renterId: 1 });
    await db.collection("rentals").createIndex({ outfitId: 1 });
    await db.collection("rentals").createIndex({ ownerId: 1 });
    await db.collection("rentals").createIndex({ status: 1 });
    await db.collection("rentals").createIndex({ startDate: 1 });

    // Rating indexes
    await db.collection("ratings").createIndex({ outfitId: 1 });
    await db.collection("ratings").createIndex({ toUserId: 1 });
    await db.collection("ratings").createIndex({ fromUserId: 1 });

    console.log("✅ Database indexes created successfully");
  } catch (error) {
    console.error("⚠️  Warning: Could not create indexes:", error);
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log("✅ MongoDB connection closed");
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
