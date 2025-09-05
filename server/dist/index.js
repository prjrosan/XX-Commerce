"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsManager = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const init_1 = require("./database/init");
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const payments_1 = __importDefault(require("./routes/payments"));
const stripePayments_1 = __importDefault(require("./routes/stripePayments"));
const chat_1 = __importDefault(require("./routes/chat"));
const ratings_1 = __importDefault(require("./routes/ratings"));
const websocket_1 = require("./services/websocket");
dotenv_1.default.config();
console.log("🔧 Environment loaded:");
console.log("  - NODE_ENV:", process.env.NODE_ENV);
console.log("  - JWT_SECRET:", process.env.JWT_SECRET ? "***SET***" : "NOT SET");
console.log("  - PORT:", process.env.PORT);
console.log("  - CORS_ORIGIN:", process.env.CORS_ORIGIN);
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const port = process.env.PORT || 3001;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(limiter);
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
const wss = new ws_1.WebSocketServer({ server });
const wsManager = new websocket_1.WebSocketManager(wss);
exports.wsManager = wsManager;
app.use("/api/auth", auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/stripe-payments", stripePayments_1.default);
app.use("/api/chat", chat_1.default);
app.use("/api/ratings", ratings_1.default);
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        port: port,
        nodeEnv: process.env.NODE_ENV
    });
});
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});
async function startServer() {
    try {
        console.log("🔌 Initializing database...");
        await (0, init_1.initializeDatabase)();
        console.log("✅ Database initialized successfully");
    }
    catch (error) {
        console.error("❌ Database initialization failed:", error);
        console.log("⚠️  Continuing without database...");
    }
    console.log("🚀 Starting server...");
    server.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📱 Frontend: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
        console.log(`🔌 WebSocket: ws://0.0.0.0:${port}`);
        console.log(`🌐 Health check: http://0.0.0.0:${port}/api/health`);
    });
}
startServer();
//# sourceMappingURL=index.js.map