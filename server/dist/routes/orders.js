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
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        GROUP_CONCAT(p.title || ' (x' || oi.quantity || ')') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
        init_1.db.all(query, [userId], (err, orders) => {
            if (err) {
                console.error('Error getting orders:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                success: true,
                data: (orders || []).map((order) => ({
                    ...order,
                    items_summary: order.items_summary || 'No items'
                }))
            });
        });
    }
    catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        init_1.db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId], (err, order) => {
            if (err) {
                console.error('Error getting order:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            const itemsQuery = `
        SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.title,
          p.description,
          p.category,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
            init_1.db.all(itemsQuery, [id], (err, items) => {
                if (err) {
                    console.error('Error getting order items:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({
                    success: true,
                    data: {
                        ...order,
                        items: items || []
                    }
                });
            });
        });
    }
    catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('shipping_address').trim().isLength({ min: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { shipping_address } = req.body;
        const cartQuery = `
      SELECT 
        ci.product_id,
        ci.quantity,
        p.price,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `;
        init_1.db.all(cartQuery, [userId], (err, cartItems) => {
            if (err) {
                console.error('Error getting cart items:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }
            for (const item of cartItems) {
                if (item.stock_quantity < item.quantity) {
                    return res.status(400).json({
                        error: `Insufficient stock for product ID ${item.product_id}. Available: ${item.stock_quantity}, Requested: ${item.quantity}`
                    });
                }
            }
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            init_1.db.run('INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)', [userId, total, shipping_address], function (err) {
                if (err) {
                    console.error('Error creating order:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                const orderId = this.lastID;
                let completed = 0;
                const totalItems = cartItems.length;
                const processNextItem = (index) => {
                    if (index >= totalItems) {
                        init_1.db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                            if (err) {
                                console.error('Error clearing cart:', err);
                            }
                            res.status(201).json({
                                success: true,
                                message: 'Order created successfully',
                                data: {
                                    order: {
                                        id: orderId,
                                        user_id: userId,
                                        total_amount: total,
                                        status: 'pending',
                                        payment_status: 'pending',
                                        shipping_address,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString()
                                    }
                                }
                            });
                        });
                        return;
                    }
                    const item = cartItems[index];
                    init_1.db.run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.product_id, item.quantity, item.price], function (err) {
                        if (err) {
                            console.error('Error creating order item:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        init_1.db.run('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id], function (err) {
                            if (err) {
                                console.error('Error updating stock:', err);
                                return res.status(500).json({ error: 'Database error' });
                            }
                            completed++;
                            processNextItem(index + 1);
                        });
                    });
                };
                processNextItem(0);
            });
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.patch('/:id/status', auth_1.authenticateToken, [
    (0, express_validator_1.body)('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    (0, express_validator_1.body)('payment_status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { status, payment_status } = req.body;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const updateData = { status };
        if (payment_status)
            updateData.payment_status = payment_status;
        const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const updateValues = [...Object.values(updateData), id];
        init_1.db.run(`UPDATE orders SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, updateValues, function (err) {
            if (err) {
                console.error('Error updating order:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json({
                success: true,
                message: 'Order updated successfully'
            });
        });
    }
    catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map