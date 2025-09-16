const { PaymentService } = require('./dist/services/paymentService');

async function testPayment() {
  try {
    console.log('🧪 Testing payment service...');
    
    const result = await PaymentService.processPayment(
      50,
      'cash_on_delivery',
      4000,
      { method: 'cash_on_delivery', amount: 4000, currency: 'JPY' }
    );
    
    console.log('✅ Payment result:', result);
    
  } catch (error) {
    console.error('❌ Payment test error:', error);
  }
}

testPayment();
