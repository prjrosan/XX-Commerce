import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { Order, Product, Cart } from '../models';
import mongoose from 'mongoose';

const router = Router();

// Get user's orders
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const orders = await Order.find({ user_id: userId })
      .populate({
        path: 'items.product_id',
        model: 'Product',
        select: 'name price images'
      })
      .sort({ created_at: -1 });

    // Transform orders to include items summary
    const transformedOrders = orders.map(order => {
      const items_summary = order.items
        .map(item => `${(item.product_id as any).name} (x${item.quantity})`)
        .join(', ');

      return {
        id: order._id.toString(),
        user_id: order.user_id.toString(),
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        shipping_address: order.shipping_address,
        shipping_method: order.shipping_method,
        tracking_number: order.tracking_number,
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString(),
        items_summary
      };
    });

    res.json({
      success: true,
      data: transformedOrders
    });

  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get order by ID with items
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const order = await Order.findOne({ 
      _id: id, 
      user_id: userId 
    }).populate({
      path: 'items.product_id',
      model: 'Product'
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform order items
    const items = order.items.map((item, index) => ({
      id: `${order._id}-${index}`,
      order_id: order._id.toString(),
      product_id: item.product_id._id.toString(),
      quantity: item.quantity,
      price: item.price,
      customization_options: item.customization_options || {},
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

    const transformedOrder = {
      id: order._id.toString(),
      user_id: order.user_id.toString(),
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      shipping_method: order.shipping_method,
      tracking_number: order.tracking_number,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
      items
    };

    res.json({
      success: true,
      data: transformedOrder
    });

  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create order
router.post('/', [
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isString().notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('shipping_address').isString().notEmpty(),
  body('shipping_method').isString().notEmpty()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const { items, shipping_address, shipping_method } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    // Validate each item and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(400).json({ 
          error: `Product ${item.product_id} not found` 
        });
      }

      if (!product.is_active) {
        return res.status(400).json({ 
          error: `Product ${product.name} is not available` 
        });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.price,
        customization_options: item.customization_options || {}
      });
    }

    // Create order
    const newOrder = new Order({
      user_id: userId,
      items: orderItems,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      shipping_address,
      shipping_method,
      created_at: new Date(),
      updated_at: new Date()
    });

    await newOrder.save();

    // Update product stock after successful order creation
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user_id: userId },
      { items: [] }
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: newOrder._id.toString(),
          user_id: newOrder.user_id.toString(),
          total_amount: newOrder.total_amount,
          status: newOrder.status,
          payment_status: newOrder.payment_status,
          shipping_address: newOrder.shipping_address,
          shipping_method: newOrder.shipping_method,
          created_at: newOrder.created_at.toISOString(),
          updated_at: newOrder.updated_at.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Database error' 
    });
  }
});

// Update order status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('payment_status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded']),
  body('tracking_number').optional().isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, payment_status, tracking_number } = req.body;

    const updateData: any = { 
      status, 
      updated_at: new Date() 
    };

    if (payment_status) updateData.payment_status = payment_status;
    if (tracking_number) updateData.tracking_number = tracking_number;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: {
        id: order._id.toString(),
        status: order.status,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number
      }
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Cancel order
router.patch('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const order = await Order.findOne({ 
      _id: id, 
      user_id: userId 
    }).populate('items.product_id');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Only pending orders can be cancelled' 
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock_quantity: item.quantity } }
      );
    }

    // Update order status
    order.status = 'cancelled';
    order.updated_at = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router; 