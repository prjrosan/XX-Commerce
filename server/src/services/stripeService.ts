import Stripe from 'stripe'

// Using Stripe's free test mode - no real money charged
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef', {
  apiVersion: '2025-07-30.basil'
})

export class StripeService {
  // Create payment intent for real Stripe processing
  static async createPaymentIntent(amount: number, currency: string = 'jpy'): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Stripe expects amount in smallest currency unit (yen)
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          integration_check: 'accept_a_payment',
        }
      })
      
      return paymentIntent
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })
      
      return paymentIntent
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error)
      throw new Error('Payment confirmation failed')
    }
  }

  // Create customer for future payments
  static async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      })
      
      return customer
    } catch (error) {
      console.error('Stripe customer creation failed:', error)
      throw new Error('Failed to create customer')
    }
  }

  // Get payment method details
  static async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
      return paymentMethod
    } catch (error) {
      console.error('Failed to retrieve payment method:', error)
      throw new Error('Failed to retrieve payment method')
    }
  }

  // Create setup intent for saving payment methods
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      })
      
      return setupIntent
    } catch (error) {
      console.error('Setup intent creation failed:', error)
      throw new Error('Failed to create setup intent')
    }
  }

  // Process webhook events
  static async handleWebhook(body: string, signature: string): Promise<Stripe.Event> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
    
    try {
      const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      return event
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      throw new Error('Webhook signature verification failed')
    }
  }
} 