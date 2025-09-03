import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';

const router = Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('accountType').optional().isIn(['user', 'seller'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, accountType = 'user' } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const query = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
      db.run(query, [email, hashedPassword, name, accountType], function(err) {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, email, name, role: accountType },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );

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

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  try {
    console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log('👤 User found:', user ? { id: (user as any).id, email: (user as any).email, name: (user as any).name } : 'Not found');
      
      if (!user) {
        console.log('❌ User not found for email:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare password
      console.log('🔑 Comparing passwords...');
      const isValidPassword = await bcrypt.compare(password, (user as any).password);
      console.log('🔑 Password comparison result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for user:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: (user as any).id, email: (user as any).email, name: (user as any).name, role: (user as any).role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      console.log('✅ Login successful for user:', email);
      res.json({
        success: true,
        data: {
          user: { 
            id: (user as any).id, 
            email: (user as any).email, 
            name: (user as any).name, 
            role: (user as any).role 
          },
          token
        }
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      db.get('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
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
              id: (user as any).id, 
              email: (user as any).email, 
              name: (user as any).name, 
              role: (user as any).role 
            }
          }
        });
      });

    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 