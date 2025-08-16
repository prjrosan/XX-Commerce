"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeService_1 = require("../services/stripeService");
const paymentService_1 = require("../services/paymentService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/create-payment-intent', auth_1.authenticateToken, async (req, res) => {
    try {
        const { amount, currency = 'jpy' } = req.body;
        const userId = req.user.id;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const paymentIntent = await stripeService_1.StripeService.createPaymentIntent(amount, currency);
        res.json({
            success: true,
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
    }
    catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment intent' });
    }
});
router.post('/process-stripe/:orderId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { payment_intent_id } = req.body;
        const userId = req.user.id;
        const db = require('../database/init').db;
        const order = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId], (err, order) => {
                if (err)
                    reject(err);
                else
                    resolve(order);
            });
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.payment_status === 'completed') {
            return res.status(400).json({ error: 'Order already paid' });
        }
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef');
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        let paymentStatus = 'pending';
        let transactionId = payment_intent_id;
        if (paymentIntent.status === 'succeeded') {
            paymentStatus = 'completed';
        }
        else if (paymentIntent.status === 'processing') {
            paymentStatus = 'processing';
        }
        else if (paymentIntent.status === 'requires_payment_method') {
            paymentStatus = 'failed';
        }
        const payment = await paymentService_1.PaymentService.savePayment({
            order_id: parseInt(orderId),
            payment_method: 'stripe_card',
            payment_status: paymentStatus,
            amount: order.total_amount,
            transaction_id: transactionId,
            payment_details: {
                stripe_payment_intent_id: payment_intent_id,
                stripe_status: paymentIntent.status
            }
        });
        await paymentService_1.PaymentService.updateOrderPaymentStatus(parseInt(orderId), paymentStatus);
        res.json({
            success: paymentStatus === 'completed',
            payment,
            transaction_id: transactionId,
            payment_status: paymentStatus,
            message: paymentStatus === 'completed' ? 'Payment completed successfully!' :
                paymentStatus === 'processing' ? 'Payment is being processed' : 'Payment failed'
        });
    }
    catch (error) {
        console.error('Stripe payment processing error:', error);
        res.status(500).json({ error: error.message || 'Payment processing failed' });
    }
});
router.get('/config', (req, res) => {
    res.json({
        publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef'
    });
});
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const event = await stripeService_1.StripeService.handleWebhook(req.body, signature);
        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', event.data.object);
                break;
            case 'payment_intent.payment_failed':
                console.log('Payment failed:', event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=stripePayments.js.map