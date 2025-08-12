import { useState } from 'react'
import { CreditCard, Smartphone, Building, Truck } from 'lucide-react'
import { PaymentRequest } from '../types'

interface PaymentFormProps {
  amount: number
  onSubmit: (paymentData: PaymentRequest) => void
  loading?: boolean
}

export default function PaymentForm({ amount, onSubmit, loading = false }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card')
  const [formData, setFormData] = useState({
    card_number: '',
    card_holder: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    paypal_email: '',
    bank_name: '',
    account_number: ''
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const paymentData: PaymentRequest = {
      payment_method: paymentMethod as any,
      payment_details: formData
    }
    
    onSubmit(paymentData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">💳 Payment Details</h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-lg font-semibold text-blue-900">
          Total Amount: {formatPrice(amount)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Credit Card</span>
              </div>
            </div>
            
            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'debit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('debit_card')}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>Debit Card</span>
              </div>
            </div>

            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <span>PayPal</span>
              </div>
            </div>

            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('bank_transfer')}
            >
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-800" />
                <span>Bank Transfer</span>
              </div>
            </div>

            <div
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'cash_on_delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('cash_on_delivery')}
            >
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-orange-600" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Payment Fields */}
        {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                name="card_number"
                value={formData.card_number}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
                className="input w-full"
                maxLength={19}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Name *
              </label>
              <input
                type="text"
                name="card_holder"
                value={formData.card_holder}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  name="expiry_month"
                  value={formData.expiry_month}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {(i + 1).toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  name="expiry_year"
                  value={formData.expiry_year}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={(new Date().getFullYear() + i).toString()}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                  className="input w-full"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* PayPal Fields */}
        {paymentMethod === 'paypal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Email *
            </label>
            <input
              type="email"
              name="paypal_email"
              value={formData.paypal_email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              className="input w-full"
            />
          </div>
        )}

        {/* Bank Transfer Fields */}
        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                placeholder="Bank of Japan"
                required
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                placeholder="1234567890"
                required
                className="input w-full"
              />
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Bank transfers may take 1-3 business days to process.
              </p>
            </div>
          </div>
        )}

        {/* Cash on Delivery */}
        {paymentMethod === 'cash_on_delivery' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <Truck className="h-5 w-5" />
              <span className="font-medium">Cash on Delivery</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              You will pay in cash when your order is delivered to your address.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Processing...' : `Pay ${formatPrice(amount)}`}
        </button>
      </form>
    </div>
  )
} 