"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const router = (0, express_1.Router)();
router.post("/register", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 }),
    (0, express_validator_1.body)("name").trim().isLength({ min: 2 }),
    (0, express_validator_1.body)("accountType").optional().isIn(["user", "seller"])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name, accountType = "user" } = req.body;
        const [existingUsers] = await init_1.db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const [result] = await init_1.db.execute("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", [email, hashedPassword, name, accountType]);
        const userId = result.insertId;
        const token = jsonwebtoken_1.default.sign({ id: userId, email, name, role: accountType }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" });
        res.status(201).json({
            success: true,
            data: {
                user: { id: userId, email, name, role: accountType },
                token
            }
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("password").isLength({ min: 6 })
], async (req, res) => {
    try {
        console.log("🔐 Login attempt:", { email: req.body.email, hasPassword: !!req.body.password });
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log("❌ Validation errors:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        console.log("🔍 Looking up user:", email);
        const [users] = await init_1.db.execute("SELECT * FROM users WHERE email = ?", [email]);
        console.log("📊 Database result:", { usersCount: users?.length, users: users });
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = users[0];
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" });
        res.json({
            success: true,
            data: {
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
                token
            }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map