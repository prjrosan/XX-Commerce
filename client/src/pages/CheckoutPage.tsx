import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { api } from '../lib/api'
import { PaymentRequest } from '../types'
import SimplePaymentForm from '../components/SimplePaymentForm'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [shippingAddress, setShippingAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing'>('shipping')
  const [orderId, setOrderId] = useState<number | null>(null)

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address')
      return
    }

    setIsLoading(true)
    
    try {
      // Create order first
              const orderItems = items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      
      const response = await api.post('/orders', {
        items: orderItems,
        shipping_address: shippingAddress,
        shipping_method: 'standard' // Default shipping method
      })
      
      if (response.data.success && response.data.data?.order?.id) {
        setOrderId(response.data.data.order.id)
        setStep('payment')
        toast.success('Order created! Please complete payment.')
      } else {
        console.error('Unexpected response format:', response.data)
        throw new Error('Invalid response format from server')
      }
    } catch (error: any) {
      console.error('Order creation error:', error)
      
      // Handle specific error cases
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Authentication failed. Please log in again.')
        // Redirect to login
        navigate('/login')
        return
      }
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create order'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async (paymentData: PaymentRequest) => {
    if (!orderId) {
      toast.error('No order found. Please try again.')
      return
    }
    
    setIsLoading(true)
    setStep('processing')
    
    try {
      const response = await api.post(`/payments/process/${orderId}`, paymentData)
      
      if (response.data.success) {
        await clearCart()
        toast.success(response.data.message || 'Payment completed successfully!')
        navigate('/orders')
      } else {
        const errorMessage = response.data.error || 'Payment failed'
        toast.error(errorMessage)
        setStep('payment')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Payment failed'
      toast.error(errorMessage)
      setStep('payment')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      
      {/* Progress Steps */}
      <nav aria-label="Checkout progress" className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step === 'shipping' ? 'text-blue-600' : step === 'payment' || step === 'processing' ? 'text-green-600' : 'text-gray-400'}`}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-blue-600 text-white' : step === 'payment' || step === 'processing' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
            aria-current={step === 'shipping' ? 'step' : undefined}
          >
            1
          </div>
          <span>Shipping</span>
        </div>
        <div className="w-12 h-1 bg-gray-300" role="progressbar" aria-label="Checkout progress">
          <div className={`h-full transition-all duration-300 ${step === 'payment' || step === 'processing' ? 'bg-green-600' : 'bg-gray-300'} ${step === 'payment' || step === 'processing' ? 'progress-bar-active' : 'progress-bar-inactive'}`}></div>
        </div>
        <div className={`flex items-center space-x-2 ${step === 'payment' ? 'text-blue-600' : step === 'processing' ? 'text-green-600' : 'text-gray-400'}`}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-600 text-white' : step === 'processing' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
            aria-current={step === 'payment' ? 'step' : undefined}
          >
            2
          </div>
          <span>Payment</span>
        </div>
      </nav>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                                              <p className="font-medium">{item.product?.title}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold">
                  ¥{((item.product?.price || 0) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
          </div>
          
          {step !== 'shipping' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Shipping Address:</h3>
              <p className="text-sm text-green-700">{shippingAddress}</p>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div>
          {step === 'shipping' && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">🚚 Shipping Details</h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address *
                  </label>
                  <textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="input h-24 resize-none"
                    placeholder="Enter your full shipping address including postal code..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3"
                  aria-describedby={isLoading ? "loading-text" : undefined}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner" aria-hidden="true"></div>
                      <span id="loading-text">Processing...</span>
                    </>
                  ) : (
                    `Continue to Payment - ¥${total.toLocaleString()}`
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'payment' && (
            <SimplePaymentForm
              amount={total}
              onSubmit={handlePaymentSubmit}
              loading={isLoading}
            />
          )}

          {step === 'processing' && (
            <div className="card p-6 text-center" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
              <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
              <p className="text-gray-600">Please wait while we process your payment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 