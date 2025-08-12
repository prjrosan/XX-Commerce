import { db } from '../database/init'
import { Payment } from '../types'

export class PaymentService {
  // Simulate payment processing for different methods
  static async processPayment(
    orderId: number,
    paymentMethod: string,
    amount: number,
    paymentDetails?: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    
    // Simulate different payment methods
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return this.processCardPayment(paymentDetails)
      
      case 'paypal':
        return this.processPayPalPayment(paymentDetails)
      
      case 'paypay':
        return this.processPayPayPayment(paymentDetails)
      
      case 'bank_transfer':
        return this.processBankTransfer(paymentDetails)
      
      case 'cash_on_delivery':
        return this.processCashOnDelivery()
      
      default:
        return { success: false, error: 'Unsupported payment method' }
    }
  }

  private static async processCardPayment(cardDetails: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate card validation
    if (!cardDetails?.card_number || !cardDetails?.cvv || !cardDetails?.card_holder) {
      return { success: false, error: 'Invalid card details' }
    }

    // Simulate payment processing (90% success rate)
    const success = Math.random() > 0.1
    
    if (success) {
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return { success: true, transactionId }
    } else {
      return { success: false, error: 'Card payment declined' }
    }
  }

  private static async processPayPalPayment(paypalDetails: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!paypalDetails?.paypal_email) {
      return { success: false, error: 'PayPal email required' }
    }

    // Simulate PayPal processing (95% success rate)
    const success = Math.random() > 0.05
    
    if (success) {
      const transactionId = `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return { success: true, transactionId }
    } else {
      return { success: false, error: 'PayPal payment failed' }
    }
  }

  private static async processPayPayPayment(paypayDetails: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!paypayDetails?.paypay_phone) {
      return { success: false, error: 'PayPay phone number required' }
    }

    // Validate Japanese phone number format (basic)
    const phoneRegex = /^(\+81|0)[0-9]{10,11}$/
    if (!phoneRegex.test(paypayDetails.paypay_phone)) {
      return { success: false, error: 'Invalid Japanese phone number format' }
    }

    // Simulate PayPay processing (98% success rate - very reliable in Japan)
    const success = Math.random() > 0.02
    
    if (success) {
      const transactionId = `PAYPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return { success: true, transactionId }
    } else {
      return { success: false, error: 'PayPay payment failed' }
    }
  }

  private static async processBankTransfer(bankDetails: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!bankDetails?.bank_name || !bankDetails?.account_number) {
      return { success: false, error: 'Bank details required' }
    }

    // Bank transfers are always pending initially
    const transactionId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { success: true, transactionId }
  }

  private static async processCashOnDelivery(): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // COD is always accepted
    const transactionId = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { success: true, transactionId }
  }

  // Save payment record to database
  static async savePayment(paymentData: {
    order_id: number;
    payment_method: string;
    payment_status: string;
    amount: number;
    transaction_id?: string;
    payment_details?: any;
  }): Promise<Payment | null> {
    return new Promise((resolve, reject) => {
      const { order_id, payment_method, payment_status, amount, transaction_id, payment_details } = paymentData

      db.run(
        `INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_id, payment_details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [order_id, payment_method, payment_status, amount, transaction_id, JSON.stringify(payment_details)],
        function (err: any) {
          if (err) {
            reject(err)
            return
          }

          // Fetch the created payment
          db.get(
            'SELECT * FROM payments WHERE id = ?',
            [this.lastID],
            (err: any, payment: any) => {
              if (err) {
                reject(err)
                return
              }
              resolve(payment)
            }
          )
        }
      )
    })
  }

  // Update order payment status
  static async updateOrderPaymentStatus(orderId: number, paymentStatus: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [paymentStatus, orderId],
        (err: any) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        }
      )
    })
  }

  // Get payment by order ID
  static async getPaymentByOrderId(orderId: number): Promise<Payment | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payments WHERE order_id = ?',
        [orderId],
        (err: any, payment: any) => {
          if (err) {
            reject(err)
            return
          }
          resolve(payment || null)
        }
      )
    })
  }
} 