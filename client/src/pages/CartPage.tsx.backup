import { useCartStore } from '../store/cart'
import { Trash2, Minus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function CartPage() {
  const { items, total, updateQuantity, removeFromCart, isLoading } = useCartStore()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex space-x-4">
                <div className="bg-gray-200 h-24 w-24 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-500 text-lg mb-8">Your cart is empty</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex space-x-4">
                <img
                  src={item.product?.image_url || 'https://via.placeholder.com/100x100?text=Product'}
                  alt={item.product?.title}
                  className="h-24 w-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {item.product?.title}
                  </h3>
                  <p className="text-primary-600 font-bold">
                    {formatPrice(item.product?.price || 0)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                      className="p-1 rounded border hover:bg-gray-50"
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-1 rounded border hover:bg-gray-50"
                      title="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
          </div>
          <Link
            to="/checkout"
            className="btn btn-primary w-full"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
} 