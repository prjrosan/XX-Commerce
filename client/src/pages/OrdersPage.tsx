import { useState, useEffect } from 'react'
import { Order, ApiResponse, Rating } from '../types'
import { api } from '../lib/api'
import RatingForm from '../components/RatingForm'
import { RatingDisplay } from '../components/RatingDisplay'
import { Star, MessageCircle } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState<number | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await api.get<ApiResponse<Order[]>>('/orders')
        if (response.data.data) {
          setOrders(response.data.data)
        }
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const loadRatings = async () => {
      try {
        const response = await api.get<ApiResponse<{ ratings: Rating[] }>>('/ratings/my-ratings')
        if (response.data.data) {
          setRatings(response.data.data.ratings)
        }
      } catch (error) {
        console.error('Failed to load ratings:', error)
      }
    }

    loadOrders()
    loadRatings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderRating = (orderId: number) => {
    return ratings.find(rating => rating.order_id === orderId)
  }

  const handleRatingSubmitted = () => {
    setShowRatingForm(null)
    // Reload ratings
    api.get<ApiResponse<{ ratings: Rating[] }>>('/ratings/my-ratings')
      .then(response => {
        if (response.data.data) {
          setRatings(response.data.data.ratings)
        }
      })
      .catch(error => {
        console.error('Failed to reload ratings:', error)
      })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderRating = getOrderRating(order.id)
            
            return (
              <div key={order.id} className="card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mt-2">
                      {order.items_summary || 'Order items'}
                    </p>
                    
                    {/* Rating Section */}
                    {order.status === 'delivered' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        {orderRating ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RatingDisplay rating={orderRating.rating} size="sm" />
                              <span className="text-sm text-gray-600">
                                Your rating
                              </span>
                            </div>
                            {orderRating.comment && (
                              <p className="text-sm text-gray-700 italic">
                                "{orderRating.comment}"
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Rated on {new Date(orderRating.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <Star className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-600">Rate your experience</span>
                            </div>
                            <button
                              onClick={() => setShowRatingForm(order.id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>Rate Order</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Rating Form Modal */}
                {showRatingForm === order.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="max-w-md w-full">
                      <RatingForm
                        orderId={order.id}
                        onRatingSubmitted={handleRatingSubmitted}
                        onCancel={() => setShowRatingForm(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 