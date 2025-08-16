"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef', {
    apiVersion: '2025-07-30.basil'
});
class StripeService {
    static async createPaymentIntent(amount, currency = 'jpy') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount),
                currency: currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    integration_check: 'accept_a_payment',
                }
            });
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe payment intent creation failed:', error);
            throw new Error('Failed to create payment intent');
        }
    }
    static async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe payment confirmation failed:', error);
            throw new Error('Payment confirmation failed');
        }
    }
    static async createCustomer(email, name) {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
            });
            return customer;
        }
        catch (error) {
            console.error('Stripe customer creation failed:', error);
            throw new Error('Failed to create customer');
        }
    }
    static async getPaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
            return paymentMethod;
        }
        catch (error) {
            console.error('Failed to retrieve payment method:', error);
            throw new Error('Failed to retrieve payment method');
        }
    }
    static async createSetupIntent(customerId) {
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return setupIntent;
        }
        catch (error) {
            console.error('Setup intent creation failed:', error);
            throw new Error('Failed to create setup intent');
        }
    }
    static async handleWebhook(body, signature) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
        try {
            const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
            return event;
        }
        catch (error) {
            console.error('Webhook signature verification failed:', error);
            throw new Error('Webhook signature verification failed');
        }
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripeService.js.map