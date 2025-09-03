"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { category, search, sort = 'created_at', order = 'desc', page = 1, limit = 20 } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        query += ` ORDER BY ${sort} ${String(order).toUpperCase()}`;
        const offset = (Number(page) - 1) * Number(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
        const countParams = [];
        if (category && category !== 'all') {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        if (search) {
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }
        init_1.db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Error counting products:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            const total = countResult?.total || 0;
            init_1.db.all(query, params, (err, products) => {
                if (err) {
                    console.error('Error getting products:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const formattedProducts = (products || []).map((product) => ({
                    ...product,
                    formatted_price: `$${product.price.toFixed(2)}`
                }));
                res.json({
                    success: true,
                    data: {
                        products: formattedProducts,
                        pagination: {
                            page: Number(page),
                            limit: Number(limit),
                            total,
                            pages: Math.ceil(total / Number(limit))
                        }
                    }
                });
            });
        });
    }
    catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        init_1.db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
            if (err) {
                console.error('Error getting product:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({
                success: true,
                data: {
                    ...product,
                    formatted_price: `$${product.price.toFixed(2)}`
                }
            });
        });
    }
    catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdminOrSeller, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('category').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('image_url').optional().isURL(),
    (0, express_validator_1.body)('stock_quantity').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, price, category, image_url, stock_quantity = 0 } = req.body;
        const userId = req.user.id;
        const query = `
      INSERT INTO products (title, description, price, category, image_url, stock_quantity, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        init_1.db.run(query, [title, description, price, category, image_url, stock_quantity, userId], function (err) {
            if (err) {
                console.error('Error creating product:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: {
                    id: this.lastID,
                    title,
                    description,
                    price,
                    category,
                    image_url,
                    stock_quantity,
                    user_id: userId
                }
            });
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdminOrSeller, [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('category').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('image_url').optional().isURL(),
    (0, express_validator_1.body)('stock_quantity').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user.id;
        init_1.db.get('SELECT user_id FROM products WHERE id = ?', [id], (err, product) => {
            if (err) {
                console.error('Error checking product ownership:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            if (product.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to update this product' });
            }
            const updateFields = [];
            const updateValues = [];
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(updates[key]);
                }
            });
            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateValues.push(id);
            const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
            init_1.db.run(query, updateValues, function (err) {
                if (err) {
                    console.error('Error updating product:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.json({
                    success: true,
                    message: 'Product updated successfully'
                });
            });
        });
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdminOrSeller, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        init_1.db.get('SELECT user_id FROM products WHERE id = ?', [id], (err, product) => {
            if (err) {
                console.error('Error checking product ownership:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            if (product.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to delete this product' });
            }
            init_1.db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
                if (err) {
                    console.error('Error deleting product:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.json({
                    success: true,
                    message: 'Product deleted successfully'
                });
            });
        });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map