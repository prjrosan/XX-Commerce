"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const query = `
      SELECT r.*, u.name as user_name, o.total_amount, o.shipping_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN orders o ON r.order_id = o.id
      ORDER BY r.created_at DESC
    `;
        init_1.db.all(query, [], (err, ratings) => {
            if (err) {
                console.error('Error fetching ratings:', err);
                return res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
            }
            res.json({ success: true, data: { ratings } });
        });
    }
    catch (error) {
        console.error('Error in ratings route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const query = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM ratings
    `;
        init_1.db.get(query, [], (err, stats) => {
            if (err) {
                console.error('Error fetching rating stats:', err);
                return res.status(500).json({ success: false, error: 'Failed to fetch rating statistics' });
            }
            res.json({ success: true, data: { stats } });
        });
    }
    catch (error) {
        console.error('Error in rating stats route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { order_id, rating, comment } = req.body;
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        if (!order_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Invalid rating data' });
        }
        init_1.db.get('SELECT id FROM ratings WHERE user_id = ? AND order_id = ?', [user_id, order_id], (err, existing) => {
            if (err) {
                console.error('Error checking existing rating:', err);
                return res.status(500).json({ success: false, error: 'Failed to check existing rating' });
            }
            if (existing) {
                return res.status(400).json({ success: false, error: 'You have already rated this order' });
            }
            init_1.db.get('SELECT id, status FROM orders WHERE id = ? AND user_id = ?', [order_id, user_id], (err, order) => {
                if (err) {
                    console.error('Error checking order:', err);
                    return res.status(500).json({ success: false, error: 'Failed to verify order' });
                }
                if (!order) {
                    return res.status(404).json({ success: false, error: 'Order not found' });
                }
                if (order.status !== 'delivered') {
                    return res.status(400).json({ success: false, error: 'You can only rate delivered orders' });
                }
                const insertQuery = `
          INSERT INTO ratings (user_id, order_id, rating, comment)
          VALUES (?, ?, ?, ?)
        `;
                init_1.db.run(insertQuery, [user_id, order_id, rating, comment || null], function (err) {
                    if (err) {
                        console.error('Error inserting rating:', err);
                        return res.status(500).json({ success: false, error: 'Failed to submit rating' });
                    }
                    res.json({
                        success: true,
                        message: 'Rating submitted successfully',
                        data: { rating_id: this.lastID }
                    });
                });
            });
        });
    }
    catch (error) {
        console.error('Error in submit rating route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
router.get('/my-ratings', auth_1.authenticateToken, async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const query = `
      SELECT r.*, o.total_amount, o.shipping_address, o.created_at as order_date
      FROM ratings r
      JOIN orders o ON r.order_id = o.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
        init_1.db.all(query, [user_id], (err, ratings) => {
            if (err) {
                console.error('Error fetching user ratings:', err);
                return res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
            }
            res.json({ success: true, data: { ratings } });
        });
    }
    catch (error) {
        console.error('Error in my ratings route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Invalid rating' });
        }
        init_1.db.get('SELECT id FROM ratings WHERE id = ? AND user_id = ?', [id, user_id], (err, existing) => {
            if (err) {
                console.error('Error checking rating:', err);
                return res.status(500).json({ success: false, error: 'Failed to check rating' });
            }
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Rating not found' });
            }
            const updateQuery = `
        UPDATE ratings 
        SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;
            init_1.db.run(updateQuery, [rating, comment || null, id, user_id], function (err) {
                if (err) {
                    console.error('Error updating rating:', err);
                    return res.status(500).json({ success: false, error: 'Failed to update rating' });
                }
                res.json({ success: true, message: 'Rating updated successfully' });
            });
        });
    }
    catch (error) {
        console.error('Error in update rating route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const checkQuery = req.user?.role === 'admin'
            ? 'SELECT id FROM ratings WHERE id = ?'
            : 'SELECT id FROM ratings WHERE id = ? AND user_id = ?';
        const checkParams = req.user?.role === 'admin' ? [id] : [id, user_id];
        init_1.db.get(checkQuery, checkParams, (err, existing) => {
            if (err) {
                console.error('Error checking rating:', err);
                return res.status(500).json({ success: false, error: 'Failed to check rating' });
            }
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Rating not found' });
            }
            init_1.db.run('DELETE FROM ratings WHERE id = ?', [id], function (err) {
                if (err) {
                    console.error('Error deleting rating:', err);
                    return res.status(500).json({ success: false, error: 'Failed to delete rating' });
                }
                res.json({ success: true, message: 'Rating deleted successfully' });
            });
        });
    }
    catch (error) {
        console.error('Error in delete rating route:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=ratings.js.map