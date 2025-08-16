"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_1 = require("../database/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAdmin);
router.get('/stats', (req, res) => {
    try {
        init_1.db.get('SELECT COUNT(*) as total FROM products', (err, productResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            init_1.db.get('SELECT COUNT(*) as total FROM orders', (err, orderResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                init_1.db.get('SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"', (err, revenueResult) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    init_1.db.get('SELECT COUNT(*) as total FROM users WHERE role = "user"', (err, customerResult) => {
                        if (err) {
                            return res.status(500).json({ error: 'Database error' });
                        }
                        init_1.db.get('SELECT COUNT(*) as total FROM products WHERE stock_quantity < 10', (err, lowStockResult) => {
                            if (err) {
                                return res.status(500).json({ error: 'Database error' });
                            }
                            init_1.db.get('SELECT COUNT(*) as total FROM orders WHERE status = "pending"', (err, pendingResult) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Database error' });
                                }
                                res.json({
                                    success: true,
                                    data: {
                                        totalProducts: productResult.total || 0,
                                        totalOrders: orderResult.total || 0,
                                        totalRevenue: revenueResult.total || 0,
                                        totalCustomers: customerResult.total || 0,
                                        lowStockProducts: lowStockResult.total || 0,
                                        pendingOrders: pendingResult.total || 0
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/orders', (req, res) => {
    const query = `
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;
    init_1.db.all(query, (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, data: orders });
    });
});
router.get('/customers', (req, res) => {
    init_1.db.all('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC', (err, customers) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, data: customers });
    });
});
router.put('/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    init_1.db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update order' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ success: true, message: 'Order status updated' });
    });
});
router.get('/orders/:id', (req, res) => {
    const { id } = req.params;
    init_1.db.get('SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?', [id], (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        init_1.db.all('SELECT oi.*, p.title, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [id], (err, items) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            order.items = items;
            res.json({ success: true, data: order });
        });
    });
});
router.get('/customers/:id', (req, res) => {
    const { id } = req.params;
    init_1.db.get('SELECT * FROM users WHERE id = ?', [id], (err, customer) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        init_1.db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [id], (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                success: true,
                data: {
                    ...customer,
                    orders,
                    totalOrders: orders.length,
                    totalSpent: orders.reduce((sum, order) => sum + order.total_amount, 0)
                }
            });
        });
    });
});
router.put('/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
        return res.status(400).json({ error: 'Invalid stock quantity' });
    }
    init_1.db.run('UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [stock_quantity, id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update stock' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Stock updated successfully' });
    });
});
router.put('/products/:id/customization', (req, res) => {
    const { id } = req.params;
    const { customization_options } = req.body;
    if (!customization_options || typeof customization_options !== 'object') {
        return res.status(400).json({ error: 'Invalid customization options' });
    }
    init_1.db.run('UPDATE products SET customization_options = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(customization_options), id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update customization options' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Customization options updated' });
    });
});
router.get('/products/low-stock', (req, res) => {
    const { threshold = 10 } = req.query;
    init_1.db.all('SELECT * FROM products WHERE stock_quantity < ? ORDER BY stock_quantity ASC', [threshold], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, data: products });
    });
});
router.get('/orders/recent', (req, res) => {
    const { limit = 10 } = req.query;
    const query = `
    SELECT o.*, u.name as customer_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT ?
  `;
    init_1.db.all(query, [limit], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, data: orders });
    });
});
router.get('/analytics/sales', (req, res) => {
    const { period = '30' } = req.query;
    const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      SUM(total_amount) as revenue
    FROM orders 
    WHERE created_at >= date('now', '-${period} days')
    AND status != 'cancelled'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
    init_1.db.all(query, (err, analytics) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, data: analytics });
    });
});
router.get('/analytics/top-products', (req, res) => {
    const { limit = 10 } = req.query;
    const query = `
    SELECT 
      p.id,
      p.title,
      p.price,
      SUM(oi.quantity) as total_sold,
      SUM(oi.quantity * oi.price) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled' OR o.status IS NULL
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT ?
  `;
    init_1.db.all(query, [limit], (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, data: products });
    });
});
exports.default = router;
//# sourceMappingURL=admin.js.map