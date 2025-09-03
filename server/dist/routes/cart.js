"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
      SELECT 
        ci.id,
        ci.user_id,
        ci.product_id,
        ci.quantity,
        ci.created_at,
        ci.updated_at,
        p.title,
        p.description,
        p.price,
        p.category,
        p.image_url,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `;
        init_1.db.all(query, [userId], (err, items) => {
            if (err) {
                console.error('Error getting cart:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            const total = (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
            res.json({
                success: true,
                data: {
                    items: (items || []).map((item) => ({
                        id: item.id,
                        user_id: item.user_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        product: {
                            id: item.product_id,
                            title: item.title,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            image_url: item.image_url,
                            stock_quantity: item.stock_quantity
                        }
                    })),
                    total: parseFloat(total.toFixed(2))
                }
            });
        });
    }
    catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/add', auth_1.authenticateToken, [
    (0, express_validator_1.body)('product_id').isInt({ min: 1 }),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { product_id, quantity } = req.body;
        init_1.db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
            if (err) {
                console.error('Error checking product:', err);
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
                    console.error('Error checking existing cart item:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (existingItem) {
                    const newQuantity = existingItem.quantity + quantity;
                    if (product.stock_quantity < newQuantity) {
                        return res.status(400).json({ error: 'Insufficient stock' });
                    }
                    init_1.db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, existingItem.id], function (err) {
                        if (err) {
                            console.error('Error updating cart item:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        res.json({
                            success: true,
                            message: 'Cart item updated successfully'
                        });
                    });
                }
                else {
                    init_1.db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, quantity], function (err) {
                        if (err) {
                            console.error('Error adding to cart:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        res.status(201).json({
                            success: true,
                            message: 'Item added to cart successfully'
                        });
                    });
                }
            });
        });
    }
    catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.put('/update/:itemId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('quantity').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        init_1.db.get('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], (err, cartItem) => {
            if (err) {
                console.error('Error checking cart item:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!cartItem) {
                return res.status(404).json({ error: 'Cart item not found' });
            }
            init_1.db.get('SELECT stock_quantity FROM products WHERE id = ?', [cartItem.product_id], (err, product) => {
                if (err) {
                    console.error('Error checking product stock:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (!product || product.stock_quantity < quantity) {
                    return res.status(400).json({ error: 'Insufficient stock' });
                }
                init_1.db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [quantity, itemId], function (err) {
                    if (err) {
                        console.error('Error updating cart item:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({
                        success: true,
                        message: 'Cart item updated successfully'
                    });
                });
            });
        });
    }
    catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.delete('/remove/:itemId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        init_1.db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], function (err) {
            if (err) {
                console.error('Error removing cart item:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Cart item not found' });
            }
            res.json({
                success: true,
                message: 'Item removed from cart successfully'
            });
        });
    }
    catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.delete('/clear', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        init_1.db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function (err) {
            if (err) {
                console.error('Error clearing cart:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                success: true,
                message: 'Cart cleared successfully'
            });
        });
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map