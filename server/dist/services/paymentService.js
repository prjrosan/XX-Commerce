"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const init_1 = require("../database/init");
class PaymentService {
    static async processPayment(orderId, paymentMethod, amount, paymentDetails) {
        switch (paymentMethod) {
            case 'credit_card':
            case 'debit_card':
                return this.processCardPayment(paymentDetails);
            case 'paypal':
                return this.processPayPalPayment(paymentDetails);
            case 'paypay':
                return this.processPayPayPayment(paymentDetails);
            case 'bank_transfer':
                return this.processBankTransfer(paymentDetails);
            case 'cash_on_delivery':
                return this.processCashOnDelivery();
            default:
                return { success: false, error: 'Unsupported payment method' };
        }
    }
    static async processCardPayment(cardDetails) {
        if (!cardDetails?.card_number || !cardDetails?.cvv || !cardDetails?.card_holder) {
            return { success: false, error: 'Invalid card details' };
        }
        const success = Math.random() > 0.1;
        if (success) {
            const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return { success: true, transactionId };
        }
        else {
            return { success: false, error: 'Card payment declined' };
        }
    }
    static async processPayPalPayment(paypalDetails) {
        if (!paypalDetails?.paypal_email) {
            return { success: false, error: 'PayPal email required' };
        }
        const success = Math.random() > 0.05;
        if (success) {
            const transactionId = `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return { success: true, transactionId };
        }
        else {
            return { success: false, error: 'PayPal payment failed' };
        }
    }
    static async processPayPayPayment(paypayDetails) {
        if (!paypayDetails?.paypay_phone) {
            return { success: false, error: 'PayPay phone number required' };
        }
        const phoneRegex = /^(\+81|0)[0-9]{10,11}$/;
        if (!phoneRegex.test(paypayDetails.paypay_phone)) {
            return { success: false, error: 'Invalid Japanese phone number format' };
        }
        const success = Math.random() > 0.02;
        if (success) {
            const transactionId = `PAYPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return { success: true, transactionId };
        }
        else {
            return { success: false, error: 'PayPay payment failed' };
        }
    }
    static async processBankTransfer(bankDetails) {
        if (!bankDetails?.bank_name || !bankDetails?.account_number) {
            return { success: false, error: 'Bank details required' };
        }
        const transactionId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { success: true, transactionId };
    }
    static async processCashOnDelivery() {
        const transactionId = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { success: true, transactionId };
    }
    static async savePayment(paymentData) {
        return new Promise((resolve, reject) => {
            const { order_id, payment_method, payment_status, amount, transaction_id, payment_details } = paymentData;
            init_1.db.run(`INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_id, payment_details)
         VALUES (?, ?, ?, ?, ?, ?)`, [order_id, payment_method, payment_status, amount, transaction_id, JSON.stringify(payment_details)], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                init_1.db.get('SELECT * FROM payments WHERE id = ?', [this.lastID], (err, payment) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(payment);
                });
            });
        });
    }
    static async updateOrderPaymentStatus(orderId, paymentStatus) {
        return new Promise((resolve, reject) => {
            init_1.db.run('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [paymentStatus, orderId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    static async getPaymentByOrderId(orderId) {
        return new Promise((resolve, reject) => {
            init_1.db.get('SELECT * FROM payments WHERE order_id = ?', [orderId], (err, payment) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(payment || null);
            });
        });
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=paymentService.js.map