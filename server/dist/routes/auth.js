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
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 })
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, name, accountType = 'user' } = req.body;
    init_1.db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        bcryptjs_1.default.hash(password, 10).then((hashedPassword) => {
            init_1.db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, name, accountType], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                const token = jsonwebtoken_1.default.sign({ id: this.lastID, email, name, role: accountType }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
                return res.status(201).json({
                    success: true,
                    data: {
                        user: { id: this.lastID, email, name, role: accountType },
                        token
                    }
                });
            });
        }).catch((error) => {
            return res.status(500).json({ error: 'Server error' });
        });
    });
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    init_1.db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        bcryptjs_1.default.compare(password, user.password || '').then((isValidPassword) => {
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
            return res.json({
                success: true,
                data: {
                    user: { id: user.id, email: user.email, name: user.name, role: user.role },
                    token
                }
            });
        }).catch((error) => {
            return res.status(500).json({ error: 'Server error' });
        });
    });
});
router.get('/me', (req, res) => {
    return res.json({ success: true, data: null });
});
exports.default = router;
//# sourceMappingURL=auth.js.map