import express from 'express';
import { db } from '../database/init';
import { AuthRequest } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all ratings (admin only)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
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

    db.all(query, [], (err, ratings) => {
      if (err) {
        console.error('Error fetching ratings:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
      }

      res.json({ success: true, data: { ratings } });
    });
  } catch (error) {
    console.error('Error in ratings route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get average rating statistics
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

    db.get(query, [], (err, stats) => {
      if (err) {
        console.error('Error fetching rating stats:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch rating statistics' });
      }

      res.json({ success: true, data: { stats } });
    });
  } catch (error) {
    console.error('Error in rating stats route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Submit a rating for an order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!order_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Invalid rating data' });
    }

    // Check if user has already rated this order
    db.get('SELECT id FROM ratings WHERE user_id = ? AND order_id = ?', [user_id, order_id], (err, existing) => {
      if (err) {
        console.error('Error checking existing rating:', err);
        return res.status(500).json({ success: false, error: 'Failed to check existing rating' });
      }

      if (existing) {
        return res.status(400).json({ success: false, error: 'You have already rated this order' });
      }

      // Check if the order belongs to the user and is completed
      db.get('SELECT id, status FROM orders WHERE id = ? AND user_id = ?', [order_id, user_id], (err, order: any) => {
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

        // Insert the rating
        const insertQuery = `
          INSERT INTO ratings (user_id, order_id, rating, comment)
          VALUES (?, ?, ?, ?)
        `;

        db.run(insertQuery, [user_id, order_id, rating, comment || null], function(err) {
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
  } catch (error) {
    console.error('Error in submit rating route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get user's ratings
router.get('/my-ratings', authenticateToken, async (req: AuthRequest, res) => {
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

    db.all(query, [user_id], (err, ratings) => {
      if (err) {
        console.error('Error fetching user ratings:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
      }

      res.json({ success: true, data: { ratings } });
    });
  } catch (error) {
    console.error('Error in my ratings route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update a rating
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
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

    // Check if rating exists and belongs to user
    db.get('SELECT id FROM ratings WHERE id = ? AND user_id = ?', [id, user_id], (err, existing) => {
      if (err) {
        console.error('Error checking rating:', err);
        return res.status(500).json({ success: false, error: 'Failed to check rating' });
      }

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Rating not found' });
      }

      // Update the rating
      const updateQuery = `
        UPDATE ratings 
        SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      db.run(updateQuery, [rating, comment || null, id, user_id], function(err) {
        if (err) {
          console.error('Error updating rating:', err);
          return res.status(500).json({ success: false, error: 'Failed to update rating' });
        }

        res.json({ success: true, message: 'Rating updated successfully' });
      });
    });
  } catch (error) {
    console.error('Error in update rating route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete a rating
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Check if rating exists and belongs to user (or user is admin)
    const checkQuery = req.user?.role === 'admin' 
      ? 'SELECT id FROM ratings WHERE id = ?'
      : 'SELECT id FROM ratings WHERE id = ? AND user_id = ?';
    
    const checkParams = req.user?.role === 'admin' ? [id] : [id, user_id];

    db.get(checkQuery, checkParams, (err, existing) => {
      if (err) {
        console.error('Error checking rating:', err);
        return res.status(500).json({ success: false, error: 'Failed to check rating' });
      }

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Rating not found' });
      }

      // Delete the rating
      db.run('DELETE FROM ratings WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting rating:', err);
          return res.status(500).json({ success: false, error: 'Failed to delete rating' });
        }

        res.json({ success: true, message: 'Rating deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Error in delete rating route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router; 