import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  PackageOpen
} from 'lucide-react'
import { Product, Order, User, ApiResponse } from '../types'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  lowStockProducts: number
  pendingOrders: number
}

export default function SellerPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  })
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load stats
      const statsResponse = await api.get<ApiResponse<DashboardStats>>('/admin/stats')
      if (statsResponse.data.success && statsResponse.data.data) {
        setStats(statsResponse.data.data)
      }

      // Load products
      const productsResponse = await api.get<ApiResponse<{ products: Product[] }>>('/products')
      if (productsResponse.data.success && productsResponse.data.data) {
        setProducts(productsResponse.data.data.products)
      }

      // Load orders
      const ordersResponse = await api.get<ApiResponse<Order[]>>('/admin/orders')
      if (ordersResponse.data.success && ordersResponse.data.data) {
        setOrders(ordersResponse.data.data)
      }

      // Load customers
      const customersResponse = await api.get<ApiResponse<User[]>>('/admin/customers')
      if (customersResponse.data.success && customersResponse.data.data) {
        setCustomers(customersResponse.data.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'customization', label: 'Customization', icon: Settings }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Products</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</p>
            </div>
            <PackageOpen className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{order.status}</p>
                </div>
                <p className="font-bold">{formatPrice(order.total_amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Low Stock Products</h3>
          <div className="space-y-3">
            {products.filter(p => p.stock_quantity < 10).slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-red-600">Stock: {product.stock_quantity}</p>
                </div>
                <p className="font-bold">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Customization</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/50x50'}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{product.category}</td>
                  <td className="p-4 font-bold">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      product.stock_quantity > 10 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.customization_options ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        None
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View product">
                        <Eye className="h-4 w-4" />
                      </button>
                                              <button className="p-1 hover:bg-blue-100 rounded" title="Edit product">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded" title="Delete product">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order Management</h2>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Order ID</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">#{order.id}</td>
                  <td className="p-4">Customer #{order.user_id}</td>
                  <td className="p-4">{order.items?.length || 0} items</td>
                  <td className="p-4 font-bold">{formatPrice(order.total_amount)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View order">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:bg-blue-100 rounded" title="Edit order">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCustomers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Management</h2>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{customer.name}</td>
                  <td className="p-4">{customer.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      customer.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View customer">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:bg-blue-100 rounded" title="Edit customer">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCustomization = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Product Customization Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Templates */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Customization Templates</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Electronics Template</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Colors: Black, White, Blue, Red</p>
                <p>• Sizes: Standard, Large</p>
                <p>• Engraving: Available</p>
              </div>
            </div>
            
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Clothing Template</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Sizes: S, M, L, XL</p>
                <p>• Colors: Blue, Pink, Purple, Green</p>
                <p>• Patterns: Various options</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Kitchen Template</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Materials: Wood, Bamboo, Composite</p>
                <p>• Sizes: Different lengths</p>
                <p>• Engraving: Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Customization Options</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="option-type" className="block text-sm font-medium mb-2">Option Type</label>
              <select id="option-type" className="input w-full">
                <option>Colors</option>
                <option>Sizes</option>
                <option>Materials</option>
                <option>Patterns</option>
                <option>Engraving</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Values (comma-separated)</label>
              <input 
                type="text" 
                className="input w-full" 
                placeholder="Black, White, Blue, Red"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price Adjustment</label>
              <input 
                type="number" 
                className="input w-full" 
                placeholder="0"
              />
            </div>

            <button 
              className="btn btn-primary w-full"
              type="button"
              title="Add customization option to product"
            >
              Add Customization Option
            </button>
          </div>
        </div>
      </div>

      {/* Product Customization List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Products with Customization</h3>
        <div className="space-y-3">
          {products.filter(p => p.customization_options).map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h4 className="font-medium">{product.title}</h4>
                <p className="text-sm text-gray-600">
                  {Object.keys(product.customization_options || {}).length} customization options
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-sm btn-outline"
                  type="button"
                  title="Edit product customization"
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  type="button"
                  title="View product customization details"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome back, Admin</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
        <div className="space-y-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'customization' && renderCustomization()}
        </div>
      </div>
    </div>
  )
} 