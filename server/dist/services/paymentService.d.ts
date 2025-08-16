import { Payment } from '../types';
export declare class PaymentService {
    static processPayment(orderId: number, paymentMethod: string, amount: number, paymentDetails?: any): Promise<{
        success: boolean;
        transactionId?: string;
        error?: string;
    }>;
    private static processCardPayment;
    private static processPayPalPayment;
    private static processPayPayPayment;
    private static processBankTransfer;
    private static processCashOnDelivery;
    static savePayment(paymentData: {
        order_id: number;
        payment_method: string;
        payment_status: string;
        amount: number;
        transaction_id?: string;
        payment_details?: any;
    }): Promise<Payment | null>;
    static updateOrderPaymentStatus(orderId: number, paymentStatus: string): Promise<void>;
    static getPaymentByOrderId(orderId: number): Promise<Payment | null>;
}
//# sourceMappingURL=paymentService.d.ts.map