import express from 'express'
import { PaymentService } from '../services/paymentService'
import { authenticateToken } from '../middleware/auth'
import { db } from '../database/init'

const router = express.Router()

// Process payment for an order
router.post('/process/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const { payment_method, payment_details } = req.body
    const userId = (req as any).user.id

    // Verify order belongs to user
    const order: any = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId],
        (err: any, order: any) => {
          if (err) reject(err)
          else resolve(order)
        }
      )
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({ error: 'Order already paid' })
    }

    // Process payment
    const paymentResult = await PaymentService.processPayment(
      parseInt(orderId),
      payment_method,
      order.total_amount,
      payment_details
    )

    if (!paymentResult.success) {
      // Save failed payment record
      await PaymentService.savePayment({
        order_id: parseInt(orderId),
        payment_method,
        payment_status: 'failed',
        amount: order.total_amount,
        payment_details
      })

      return res.status(400).json({ 
        error: paymentResult.error || 'Payment failed',
        payment_status: 'failed'
      })
    }

    // Determine payment status based on method
    let paymentStatus = 'completed'
    if (payment_method === 'bank_transfer') {
      paymentStatus = 'processing'
    } else if (payment_method === 'cash_on_delivery') {
      paymentStatus = 'pending'
    }

    // Save successful payment record
    const payment = await PaymentService.savePayment({
      order_id: parseInt(orderId),
      payment_method,
      payment_status: paymentStatus,
      amount: order.total_amount,
      transaction_id: paymentResult.transactionId,
      payment_details
    })

    // Update order payment status
    await PaymentService.updateOrderPaymentStatus(parseInt(orderId), paymentStatus)

    res.json({
      success: true,
      payment,
      transaction_id: paymentResult.transactionId,
      payment_status: paymentStatus,
      message: `Payment ${paymentStatus === 'completed' ? 'completed' : paymentStatus} successfully`
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    res.status(500).json({ error: 'Payment processing failed' })
  }
})

// Get payment details for an order
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = (req as any).user.id

    // Verify order belongs to user
    const db = require('../database/init').db
    const order: any = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId],
        (err: any, order: any) => {
          if (err) reject(err)
          else resolve(order)
        }
      )
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const payment = await PaymentService.getPaymentByOrderId(parseInt(orderId))

    res.json({
      order_id: orderId,
      payment_status: order.payment_status,
      payment: payment
    })

  } catch (error) {
    console.error('Get payment error:', error)
    res.status(500).json({ error: 'Failed to get payment details' })
  }
})

export default router 