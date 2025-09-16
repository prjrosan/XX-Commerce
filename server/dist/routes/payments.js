"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentService_1 = require("../services/paymentService");
const auth_1 = require("../middleware/auth");
const init_1 = require("../database/init");
const router = express_1.default.Router();
router.post('/process/:orderId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { payment_method, payment_details } = req.body;
        const userId = req.user.id;
        const order = await new Promise((resolve, reject) => {
            init_1.db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId], (err, order) => {
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
        const paymentResult = await paymentService_1.PaymentService.processPayment(parseInt(orderId), payment_method, order.total_amount, payment_details);
        if (!paymentResult.success) {
            await paymentService_1.PaymentService.savePayment({
                order_id: parseInt(orderId),
                payment_method,
                payment_status: 'failed',
                amount: order.total_amount,
                payment_details
            });
            return res.status(400).json({
                error: paymentResult.error || 'Payment failed',
                payment_status: 'failed'
            });
        }
        let paymentStatus = 'completed';
        if (payment_method === 'bank_transfer') {
            paymentStatus = 'processing';
        }
        else if (payment_method === 'cash_on_delivery') {
            paymentStatus = 'pending';
        }
        const payment = await paymentService_1.PaymentService.savePayment({
            order_id: parseInt(orderId),
            payment_method,
            payment_status: paymentStatus,
            amount: order.total_amount,
            transaction_id: paymentResult.transactionId,
            payment_details
        });
        await paymentService_1.PaymentService.updateOrderPaymentStatus(parseInt(orderId), paymentStatus);
        res.json({
            success: true,
            payment,
            transaction_id: paymentResult.transactionId,
            payment_status: paymentStatus,
            message: `Payment ${paymentStatus === 'completed' ? 'completed' : paymentStatus} successfully`
        });
    }
    catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});
router.get('/order/:orderId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
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
        const payment = await paymentService_1.PaymentService.getPaymentByOrderId(parseInt(orderId));
        res.json({
            order_id: orderId,
            payment_status: order.payment_status,
            payment: payment
        });
    }
    catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ error: 'Failed to get payment details' });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map