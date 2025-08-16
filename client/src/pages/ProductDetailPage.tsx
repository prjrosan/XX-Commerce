import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, Minus, Plus, Settings } from 'lucide-react'
import { Product, ApiResponse } from '../types'
import { api } from '../lib/api'
import { useCartStore } from '../store/cart'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [customizations, setCustomizations] = useState<Record<string, string>>({})
  const { addToCart } = useCartStore()

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      
      try {
        const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
        if (response.data.data) {
          setProduct(response.data.data)
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        toast.error('Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleCustomizationChange = (option: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      [option]: value
    }))
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      await addToCart(product.id, quantity)
      toast.success('Added to cart!')
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-96 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded animate-pulse"></div>
            <div className="bg-gray-200 h-6 rounded w-1/3 animate-pulse"></div>
            <div className="bg-gray-200 h-4 rounded animate-pulse"></div>
            <div className="bg-gray-200 h-4 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Product not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.image_url || 'https://via.placeholder.com/600x600?text=Product'}
            alt={product.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>
            <p className="text-3xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </p>
          </div>

          <div>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Stock:</span>
            <span className={`text-sm font-medium ${
              product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
            </span>
          </div>

          {/* Customization Options */}
          {product.customization_options && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Customization Options</h3>
              </div>
              
              {Object.entries(product.customization_options).map(([option, values]) => (
                <div key={option} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {option.replace(/_/g, ' ')}:
                  </label>
                  <select
                    id={`customization-${option}`}
                    aria-label={option.replace(/_/g, ' ')}
                    value={customizations[option] ?? ''}
                    onChange={e => handleCustomizationChange(option, e.target.value)}
                    className="input"
                    disabled={product.stock_quantity === 0}
                  >
                    {/* Ensure a default option is always present */}
                    <option value="">Select {option.replace('_', ' ')}</option>
                    {Array.isArray(values) ? values.map((value: string) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    )) : null}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded border hover:bg-gray-50"
                  title="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="p-1 rounded border hover:bg-gray-50"
                  title="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="btn btn-primary w-full flex items-center justify-center space-x-2 py-3"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 