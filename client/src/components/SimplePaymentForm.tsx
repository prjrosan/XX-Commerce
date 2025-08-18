import { useState } from 'react'
import { CreditCard, Smartphone, Building, Truck, DollarSign, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface SimplePaymentFormProps {
  amount: number
  onSubmit: (paymentData: any) => void
  loading?: boolean
}

export default function SimplePaymentForm({ amount, onSubmit, loading = false }: SimplePaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card')
  const [paypayPhone, setPaypayPhone] = useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== FORM SUBMIT DEBUG ===')
    console.log('Form submitted with payment method:', paymentMethod)
    console.log('PayPay phone:', paypayPhone)
    
    // Validate PayPay phone number if PayPay is selected
    if (paymentMethod === 'paypay' && !paypayPhone.trim()) {
      toast.error('Please enter your PayPay phone number')
      return
    }
    
    // Simple payment data that works with our backend
    const paymentData = {
      payment_method: paymentMethod,
      payment_details: {
        method: paymentMethod,
        amount: amount,
        currency: 'JPY',
        paypay_phone: paymentMethod === 'paypay' ? paypayPhone : undefined
      }
    }
    
    console.log('SimplePaymentForm submitting:', paymentData)
    console.log('Calling onSubmit function...')
    onSubmit(paymentData)
    console.log('onSubmit function called successfully')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <DollarSign className="h-6 w-6 mr-2 text-green-600" />
        💳 Payment Details
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border">
        <div className="text-lg font-bold text-blue-900">
          Total Amount: {formatPrice(amount)}
        </div>
        <div className="text-sm text-blue-700">
          Free test payments - No real money charged
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              type="button"
              className={`p-4 border rounded-lg text-left transition-all ${
                paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-medium">Credit Card</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              className={`p-4 border rounded-lg text-left transition-all ${
                paymentMethod === 'debit_card' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('debit_card')}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium">Debit Card</div>
                  <div className="text-sm text-gray-500">Direct bank payment</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`p-4 border rounded-lg text-left transition-all ${
                paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-medium">PayPal</div>
                  <div className="text-sm text-gray-500">Digital wallet</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`p-4 border rounded-lg text-left transition-all ${
                paymentMethod === 'paypay' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('paypay')}
            >
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-medium">PayPay 💰</div>
                  <div className="text-sm text-gray-500">Japanese mobile payment</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`p-4 border rounded-lg text-left transition-all ${
                paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('bank_transfer')}
            >
              <div className="flex items-center space-x-3">
                <Building className="h-6 w-6 text-blue-800" />
                <div>
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm text-gray-500">1-3 business days</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`p-4 border rounded-lg text-left transition-all ${
                paymentMethod === 'cash_on_delivery' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setPaymentMethod('cash_on_delivery')}
            >
              <div className="flex items-center space-x-3">
                <Truck className="h-6 w-6 text-orange-600" />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when delivered</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Method Details */}
        <div className="p-4 bg-gray-50 rounded-lg">
          {paymentMethod === 'credit_card' && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Credit Card Payment</h4>
              <p className="text-sm text-gray-600">
                💳 Test payment with instant processing. No real money will be charged.
              </p>
              <div className="text-xs text-green-600 font-medium">
                ✅ Success rate: 90% (simulated)
              </div>
            </div>
          )}

          {paymentMethod === 'debit_card' && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Debit Card Payment</h4>
              <p className="text-sm text-gray-600">
                💚 Direct bank account payment with instant processing.
              </p>
              <div className="text-xs text-green-600 font-medium">
                ✅ Success rate: 90% (simulated)
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">PayPal Payment</h4>
              <p className="text-sm text-gray-600">
                📱 Secure digital wallet payment through PayPal.
              </p>
              <div className="text-xs text-green-600 font-medium">
                ✅ Success rate: 95% (simulated)
              </div>
            </div>
          )}

          {paymentMethod === 'paypay' && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">PayPay Payment 💰</h4>
              <p className="text-sm text-gray-600">
                ⚡ Japan's most popular mobile payment app. Pay instantly with your phone!
              </p>
              <div className="text-xs text-green-600 font-medium">
                ✅ Success rate: 98% (simulated) - Very reliable in Japan
              </div>
              <div className="text-xs text-blue-600 font-medium">
                🇯🇵 Perfect for Japanese customers
              </div>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Bank Transfer</h4>
              <p className="text-sm text-gray-600">
                🏦 Direct bank transfer. May take 1-3 business days to process.
              </p>
              <div className="text-xs text-yellow-600 font-medium">
                ⏳ Processing time: 1-3 days
              </div>
            </div>
          )}

          {paymentMethod === 'cash_on_delivery' && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
              <p className="text-sm text-gray-600">
                🚚 Pay in cash when your order is delivered to your address.
              </p>
              <div className="text-xs text-green-600 font-medium">
                ✅ Always available
              </div>
            </div>
          )}
        </div>

        {/* PayPay Phone Input */}
        {paymentMethod === 'paypay' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PayPay Phone Number *
              </label>
              <input
                type="tel"
                value={paypayPhone}
                onChange={(e) => setPaypayPhone(e.target.value)}
                placeholder="080-1234-5678 or +81-80-1234-5678"
                className="input w-full"
                pattern="^(\+81|0)[0-9]{10,11}$"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Japanese phone number linked to PayPay
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-4 text-lg font-semibold"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            `Complete Payment - ${formatPrice(amount)}`
          )}
        </button>

        <div className="text-center text-sm text-gray-500">
          🔒 Your payment information is secure and encrypted
        </div>
      </form>
    </div>
  )
} 