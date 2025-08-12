import express from 'express'
import { StripeService } from '../services/stripeService'
import { PaymentService } from '../services/paymentService'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Create payment intent (Step 1 of Stripe payment)
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'jpy' } = req.body
    const userId = (req as any).user.id

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // Create Stripe payment intent
    const paymentIntent = await StripeService.createPaymentIntent(amount, currency)

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    })

  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    res.status(500).json({ error: error.message || 'Failed to create payment intent' })
  }
})

// Process Stripe payment for an order
router.post('/process-stripe/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const { payment_intent_id } = req.body
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

    if (order.payment_status === 'completed') {
      return res.status(400).json({ error: 'Order already paid' })
    }

    // Get payment intent from Stripe to verify status
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef')
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)

    let paymentStatus = 'pending'
    let transactionId = payment_intent_id

    if (paymentIntent.status === 'succeeded') {
      paymentStatus = 'completed'
    } else if (paymentIntent.status === 'processing') {
      paymentStatus = 'processing'
    } else if (paymentIntent.status === 'requires_payment_method') {
      paymentStatus = 'failed'
    }

    // Save payment record
    const payment = await PaymentService.savePayment({
      order_id: parseInt(orderId),
      payment_method: 'stripe_card',
      payment_status: paymentStatus,
      amount: order.total_amount,
      transaction_id: transactionId,
      payment_details: {
        stripe_payment_intent_id: payment_intent_id,
        stripe_status: paymentIntent.status
      }
    })

    // Update order payment status
    await PaymentService.updateOrderPaymentStatus(parseInt(orderId), paymentStatus)

    res.json({
      success: paymentStatus === 'completed',
      payment,
      transaction_id: transactionId,
      payment_status: paymentStatus,
      message: paymentStatus === 'completed' ? 'Payment completed successfully!' : 
               paymentStatus === 'processing' ? 'Payment is being processed' : 'Payment failed'
    })

  } catch (error: any) {
    console.error('Stripe payment processing error:', error)
    res.status(500).json({ error: error.message || 'Payment processing failed' })
  }
})

// Get Stripe publishable key for frontend
router.get('/config', (req, res) => {
  res.json({
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef'
  })
})

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string
    const event = await StripeService.handleWebhook(req.body, signature)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object)
        // Update order status in database
        break
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object)
        // Update order status in database
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: error.message })
  }
})

export default router 