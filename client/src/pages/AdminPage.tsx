import { useState, useEffect } from 'react'
import { Package, Users, ShoppingCart, Edit, Trash2, Settings } from 'lucide-react'
import { api } from '../lib/api'
import { Product } from '../types'
import toast from 'react-hot-toast'

interface EditFormData {
  title: string
  description: string
  price: string
  category: string
  image_url: string
  stock_quantity: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock_quantity: ''
  })

  useEffect(() => {
    loadStats()
    loadProducts()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get('/products')
      setStats(prev => ({
        ...prev,
        totalProducts: response.data.data.products.length
      }))
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products?limit=100')

      setProducts(response.data.data.products || [])
    } catch (error) {
      console.error('Load products error:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/products/${productId}`)
      
      toast.success('Product deleted successfully!')
      loadProducts()
      loadStats()
    } catch (error: any) {
      console.error('Delete error:', error)
      console.error('Error response:', error.response?.data)
      toast.error(`Failed to delete product: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity.toString()
    })
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProduct) return

    try {
      const updateData = {
        title: editFormData.title,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        category: editFormData.category,
        image_url: editFormData.image_url,
        stock_quantity: parseInt(editFormData.stock_quantity)
      }

      await api.put(`/products/${editingProduct.id}`, updateData)
      toast.success('Product updated successfully!')
      
      setEditingProduct(null)
      setEditFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock_quantity: ''
      })
      
      loadProducts()
      loadStats()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(`Failed to update product: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setEditFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      stock_quantity: ''
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h1 className="text-3xl font-bold text-red-800">🔐 Admin Dashboard</h1>
        <p className="text-red-600">You have full administrative privileges - you can edit and delete ANY product.</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Package },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'users', label: 'Users', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Dashboard Overview</h2>
            
            {/* Quick Access Panels */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">🚀 Quick Access (Admin Privileges)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/seller"
                  className="block p-4 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Seller Panel</h4>
                      <p className="text-sm text-blue-700">Add products, manage inventory</p>
                    </div>
                  </div>
                </a>
                <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-900">Admin Panel</h4>
                      <p className="text-sm text-red-700">You're here! Full system control</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Total Products</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Total Orders</h3>
                <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Total Users</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        )}

                        {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Products Management</h2>
                      <div className="text-sm text-gray-600">
                        Admin can edit and delete any product
                      </div>
                    </div>

                    {/* Edit Product Form */}
                    {editingProduct && (
                      <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
                        <h3 className="text-lg font-semibold mb-4 text-blue-900">
                          ✏️ Edit Product: {editingProduct.title}
                        </h3>
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Title *
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={editFormData.title}
                                onChange={handleEditFormChange}
                                required
                                className="input w-full"
                                placeholder="Enter product title"
                              />
                            </div>
                            <div>
                              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                              </label>
                              <select
                                id="category"
                                name="category"
                                value={editFormData.category}
                                onChange={handleEditFormChange}
                                required
                                className="input w-full"
                              >
                                <option value="">Select category</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="books">Books</option>
                                <option value="home">Home & Garden</option>
                                <option value="sports">Sports</option>
                                <option value="toys">Toys</option>
                                <option value="beauty">Beauty</option>
                                <option value="automotive">Automotive</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (JPY) *
                              </label>
                              <input
                                type="number"
                                name="price"
                                value={editFormData.price}
                                onChange={handleEditFormChange}
                                required
                                min="0"
                                step="0.01"
                                className="input w-full"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity *
                              </label>
                              <input
                                type="number"
                                name="stock_quantity"
                                value={editFormData.stock_quantity}
                                onChange={handleEditFormChange}
                                required
                                min="0"
                                className="input w-full"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditFormChange}
                              rows={3}
                              className="input w-full"
                              placeholder="Enter product description"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Image URL
                            </label>
                            <input
                              type="url"
                              name="image_url"
                              value={editFormData.image_url}
                              onChange={handleEditFormChange}
                              className="input w-full"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div className="flex space-x-3 pt-4">
                            <button
                              type="submit"
                              className="btn btn-primary flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Update Product
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.image_url || 'https://via.placeholder.com/40'}
                                alt={product.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">
                                {product.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                                                                <button
                                      onClick={() => handleEditProduct(product)}
                                      className="text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-300 rounded flex items-center space-x-1"
                                      title="Edit product"
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span>Edit</span>
                                    </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded flex items-center space-x-1"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {products.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Orders Management</h2>
            <p className="text-gray-500">Order management features coming soon...</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Users Management</h2>
            <p className="text-gray-500">User management features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
} 