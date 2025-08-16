"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const userId = req.user.id;
    const query = `
    SELECT 
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      p.id as product_id_full,
      p.title,
      p.description,
      p.price,
      p.category,
      p.image_url,
      p.stock_quantity,
      p.external_id,
      p.created_at as product_created_at,
      p.updated_at as product_updated_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `;
    init_1.db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        const items = rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            product_id: row.product_id,
            quantity: row.quantity,
            created_at: row.created_at,
            updated_at: row.updated_at,
            product: {
                id: row.product_id_full,
                title: row.title,
                description: row.description,
                price: row.price,
                category: row.category,
                image_url: row.image_url,
                stock_quantity: row.stock_quantity,
                external_id: row.external_id,
                created_at: row.product_created_at,
                updated_at: row.product_updated_at
            }
        }));
        const total = items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        res.json({
            success: true,
            data: {
                items,
                total: parseFloat(total.toFixed(2))
            }
        });
    });
});
router.post('/add', [
    (0, express_validator_1.body)('product_id').isInt({ min: 1 }),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 })
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    init_1.db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        init_1.db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, existingItem) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (product.stock_quantity < newQuantity) {
                    return res.status(400).json({ error: 'Insufficient stock' });
                }
                init_1.db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?', [newQuantity, userId, product_id], function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update cart' });
                    }
                    res.json({
                        success: true,
                        message: 'Cart updated successfully',
                        data: { quantity: newQuantity }
                    });
                });
            }
            else {
                init_1.db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, quantity], function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to add to cart' });
                    }
                    res.status(201).json({
                        success: true,
                        message: 'Item added to cart successfully',
                        data: { id: this.lastID }
                    });
                });
            }
        });
    });
});
router.put('/update/:productId', [
    (0, express_validator_1.body)('quantity').isInt({ min: 1 })
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    init_1.db.get('SELECT stock_quantity FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        init_1.db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?', [quantity, userId, productId], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update cart' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Cart item not found' });
            }
            res.json({
                success: true,
                message: 'Cart updated successfully',
                data: { quantity }
            });
        });
    });
});
router.delete('/remove/:productId', (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    init_1.db.run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to remove from cart' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });
    });
});
router.delete('/clear', (req, res) => {
    const userId = req.user.id;
    init_1.db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to clear cart' });
        }
        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: { removed: this.changes }
        });
    });
});
exports.default = router;
//# sourceMappingURL=cart.js.map