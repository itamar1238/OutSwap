import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { connectToDatabase } from "./config/database";
import outfitsRouter from "./routes/outfits";
import ratingsRouter from "./routes/ratings";
import rentalsRouter from "./routes/rentals";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging with colors
app.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method.padEnd(6);
  const methodColors: { [key: string]: string } = {
    GET: "\x1b[32m", // Green
    POST: "\x1b[33m", // Yellow
    PUT: "\x1b[34m", // Blue
    DELETE: "\x1b[31m", // Red
  };
  const color = methodColors[req.method] || "\x1b[37m";
  const reset = "\x1b[0m";
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });

  console.log(
    `\x1b[90m${timestamp}${reset} ${color}${method}${reset} ${req.path}`
  );
  next();
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/outfits", outfitsRouter);
app.use("/api/rentals", rentalsRouter);
app.use("/api/ratings", ratingsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║   🚀 OutSwap Backend Server Started   ║
╠═══════════════════════════════════════╣
║  Port: ${PORT}                        ║
║  Environment: ${process.env.NODE_ENV || "development"}          ║
║  Time: ${new Date().toLocaleString()}     ║
╚═══════════════════════════════════════╝
      `);
      console.log("📡 API Endpoints:");
      console.log(`   • POST   /api/outfits              - Create outfit`);
      console.log(`   • POST   /api/outfits/search       - Search outfits`);
      console.log(`   • GET    /api/outfits/:id          - Get outfit by ID`);
      console.log(
        `   • GET    /api/outfits/owner/:id    - Get owner's outfits`
      );
      console.log(`   • PUT    /api/outfits/:id          - Update outfit`);
      console.log(`   • DELETE /api/outfits/:id          - Delete outfit`);
      console.log(`   • POST   /api/rentals              - Create rental`);
      console.log(`   • POST   /api/rentals/:id/confirm  - Confirm rental`);
      console.log(`   • POST   /api/rentals/:id/return   - Mark returned`);
      console.log(`   • POST   /api/rentals/:id/cancel   - Cancel rental`);
      console.log(
        `   • GET    /api/rentals/renter/:id   - Get renter's rentals`
      );
      console.log(
        `   • GET    /api/rentals/owner/:id    - Get owner's rentals`
      );
      console.log(`   • POST   /api/ratings              - Create rating`);
      console.log(`   • GET    /api/ratings/outfit/:id   - Get outfit ratings`);
      console.log(`   • GET    /api/ratings/user/:id     - Get user ratings`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
