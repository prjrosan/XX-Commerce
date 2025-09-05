import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { initializeDatabase } from "./database/init";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payments";
import stripePaymentRoutes from "./routes/stripePayments";
import chatRoutes from "./routes/chat";
import ratingRoutes from "./routes/ratings";
import { authenticateToken } from "./middleware/auth";
import { WebSocketManager } from "./services/websocket";

// Load environment variables
dotenv.config();
console.log("🔧 Environment loaded:");
console.log("  - NODE_ENV:", process.env.NODE_ENV);
console.log("  - JWT_SECRET:", process.env.JWT_SECRET ? "***SET***" : "NOT SET");
console.log("  - PORT:", process.env.PORT);
console.log("  - CORS_ORIGIN:", process.env.CORS_ORIGIN);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize WebSocket
const wss = new WebSocketServer({ server });
const wsManager = new WebSocketManager(wss);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stripe-payments", stripePaymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ratings", ratingRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    port: port,
    nodeEnv: process.env.NODE_ENV
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log("🔌 Initializing database...");
    await initializeDatabase();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    console.log("⚠️  Continuing without database...");
  }

  // Start server regardless of database status
  console.log("🚀 Starting server...");
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Frontend: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
    console.log(`🔌 WebSocket: ws://0.0.0.0:${port}`);
    console.log(`🌐 Health check: http://0.0.0.0:${port}/api/health`);
  });
}

startServer();

export { wsManager };
