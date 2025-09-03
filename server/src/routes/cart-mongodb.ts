import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { Cart } from '../models';
import { Product } from '../models';

const router = Router();

// Get user's cart
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find user's cart and populate product details
    const cart = await Cart.findOne({ user_id: userId }).populate({
      path: 'items.product_id',
      model: 'Product',
      select: 'name description price category images stock_quantity customization_options rating is_active'
    });

    if (!cart) {
      // Create empty cart if none exists
      const newCart = new Cart({
        user_id: userId,
        items: []
      });
      await newCart.save();
      
      return res.json({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });
    }

    // Transform cart items to match expected structure
    const items = cart.items.map((item, index) => ({
      id: `${cart._id}-${index}`,
      user_id: cart.user_id.toString(),
      product_id: item.product_id._id.toString(),
      quantity: item.quantity,
      customization_options: item.customization_options || {},
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
      product: {
        id: item.product_id._id.toString(),
        name: (item.product_id as any).name,
        description: (item.product_id as any).description,
        price: (item.product_id as any).price,
        category: (item.product_id as any).category,
        images: (item.product_id as any).images,
        stock_quantity: (item.product_id as any).stock_quantity,
        customization_options: (item.product_id as any).customization_options,
        rating: (item.product_id as any).rating,
        is_active: (item.product_id as any).is_active,
        created_at: (item.product_id as any).created_at,
        updated_at: (item.product_id as any).updated_at
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

  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add item to cart
router.post('/add', [
  body('product_id').isString().notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('customization_options').optional().isObject()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const { product_id, quantity, customization_options = {} } = req.body;

    // Check if product exists and has stock
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.is_active) {
      return res.status(400).json({ error: 'Product is not available' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({
        user_id: userId,
        items: []
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product_id.toString() === product_id
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].customization_options = customization_options;
      cart.items[existingItemIndex].updated_at = new Date();
    } else {
      // Add new item
      cart.items.push({
        product_id: product_id,
        quantity: quantity,
        customization_options: customization_options,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart_id: cart._id,
        items_count: cart.items.length
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', [
  body('quantity').isInt({ min: 1 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item, index) => `${cart._id}-${index}` === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Check stock availability
    const product = await Product.findById(cart.items[itemIndex].product_id);
    if (!product || product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].updated_at = new Date();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item, index) => `${cart._id}-${index}` === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Clear cart
router.delete('/clear', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router; 