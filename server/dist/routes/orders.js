"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const userId = req.user.id;
    const query = `
    SELECT o.*, 
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
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({
            success: true,
            data: orders
        });
    });
});
router.get('/:id', (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    init_1.db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const itemsQuery = `
      SELECT oi.*, p.title, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
        init_1.db.all(itemsQuery, [id], (err, items) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                success: true,
                data: {
                    ...order,
                    items
                }
            });
        });
    });
});
router.post('/', [
    (0, express_validator_1.body)('shipping_address').trim().isLength({ min: 5 }).withMessage('Shipping address must be at least 5 characters')
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
            message: 'Please check your shipping address (minimum 5 characters required)'
        });
    }
    const userId = req.user.id;
    const { shipping_address } = req.body;
    console.log('Creating order for user:', userId, 'with address:', shipping_address);
    init_1.db.all(`SELECT ci.*, p.price, p.stock_quantity, p.title 
     FROM cart_items ci 
     JOIN products p ON ci.product_id = p.id 
     WHERE ci.user_id = ?`, [userId], (err, cartItems) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch cart items' });
        }
        if (!cartItems || cartItems.length === 0) {
            console.log('Empty cart for user:', userId);
            return res.status(400).json({
                error: 'Cart is empty',
                message: 'Please add items to your cart before checkout',
                userId: userId
            });
        }
        const items = cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            stock_quantity: item.stock_quantity
        }));
        init_1.db.serialize(() => {
            init_1.db.run('BEGIN TRANSACTION');
            let totalAmount = 0;
            let hasError = false;
            const validateItems = () => {
                return new Promise((resolve, reject) => {
                    let processed = 0;
                    items.forEach((item) => {
                        init_1.db.get('SELECT price, stock_quantity FROM products WHERE id = ?', [item.product_id], (err, product) => {
                            if (err) {
                                hasError = true;
                                reject(err);
                                return;
                            }
                            if (!product) {
                                hasError = true;
                                reject(new Error(`Product ${item.product_id} not found`));
                                return;
                            }
                            if (product.stock_quantity < item.quantity) {
                                hasError = true;
                                reject(new Error(`Insufficient stock for product ${item.product_id}`));
                                return;
                            }
                            totalAmount += product.price * item.quantity;
                            processed++;
                            if (processed === items.length) {
                                resolve(totalAmount);
                            }
                        });
                    });
                });
            };
            validateItems()
                .then(() => {
                if (hasError) {
                    init_1.db.run('ROLLBACK');
                    return;
                }
                init_1.db.run('INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)', [userId, totalAmount, shipping_address], function (err) {
                    if (err) {
                        init_1.db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to create order' });
                    }
                    const orderId = this.lastID;
                    let itemsProcessed = 0;
                    items.forEach((item) => {
                        init_1.db.run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, (SELECT price FROM products WHERE id = ?))', [orderId, item.product_id, item.quantity, item.product_id], function (err) {
                            if (err) {
                                init_1.db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Failed to create order items' });
                            }
                            init_1.db.run('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id], function (err) {
                                if (err) {
                                    init_1.db.run('ROLLBACK');
                                    return res.status(500).json({ error: 'Failed to update stock' });
                                }
                                itemsProcessed++;
                                if (itemsProcessed === items.length) {
                                    init_1.db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function (err) {
                                        if (err) {
                                            init_1.db.run('ROLLBACK');
                                            return res.status(500).json({ error: 'Failed to clear cart' });
                                        }
                                        init_1.db.run('COMMIT');
                                        res.status(201).json({
                                            success: true,
                                            message: 'Order created successfully',
                                            order: {
                                                id: orderId,
                                                total_amount: totalAmount,
                                                user_id: userId,
                                                shipping_address: shipping_address,
                                                status: 'pending',
                                                payment_status: 'pending'
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            })
                .catch((error) => {
                init_1.db.run('ROLLBACK');
                res.status(400).json({ error: error.message });
            });
        });
    });
});
router.put('/:id/status', [
    (0, express_validator_1.body)('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { status } = req.body;
    init_1.db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update order status' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { status }
        });
    });
});
exports.default = router;
//# sourceMappingURL=orders.js.map