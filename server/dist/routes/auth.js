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
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('accountType').optional().isIn(['user', 'seller'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name, accountType = 'user' } = req.body;
        init_1.db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const query = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
            init_1.db.run(query, [email, hashedPassword, name, accountType], function (err) {
                if (err) {
                    console.error('Error creating user:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const token = jsonwebtoken_1.default.sign({ id: this.lastID, email, name, role: accountType }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
                res.status(201).json({
                    success: true,
                    data: {
                        user: {
                            id: this.lastID,
                            email,
                            name,
                            role: accountType
                        },
                        token
                    }
                });
            });
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res) => {
    try {
        console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        init_1.db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('👤 User found:', user ? { id: user.id, email: user.email, name: user.name } : 'Not found');
            if (!user) {
                console.log('❌ User not found for email:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            console.log('🔑 Comparing passwords...');
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            console.log('🔑 Password comparison result:', isValidPassword);
            if (!isValidPassword) {
                console.log('❌ Invalid password for user:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
            console.log('✅ Login successful for user:', email);
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    },
                    token
                }
            });
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            init_1.db.get('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (!user) {
                    return res.status(401).json({ error: 'User not found' });
                }
                res.json({
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role
                        }
                    }
                });
            });
        }
        catch (jwtError) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map