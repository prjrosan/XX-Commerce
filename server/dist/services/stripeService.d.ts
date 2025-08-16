import Stripe from 'stripe';
export declare class StripeService {
    static createPaymentIntent(amount: number, currency?: string): Promise<Stripe.PaymentIntent>;
    static confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent>;
    static createCustomer(email: string, name: string): Promise<Stripe.Customer>;
    static getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
    static createSetupIntent(customerId: string): Promise<Stripe.SetupIntent>;
    static handleWebhook(body: string, signature: string): Promise<Stripe.Event>;
}
//# sourceMappingURL=stripeService.d.ts.map