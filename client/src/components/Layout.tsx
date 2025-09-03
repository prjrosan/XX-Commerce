import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Home, Package, Settings, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'

interface LayoutProps {
  children: ReactNode
}

// Stunning Logo Component
function StunningLogo() {
  return (
    <Link to="/" className="flex items-center space-x-3 group">
      {/* Logo Container */}
      <div className="relative">
        {/* Main Logo Circle */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-indigo-400/30 animate-pulse"></div>
          
          {/* Logo Icon */}
          <div className="relative z-10">
            <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          
          {/* Glowing Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-75" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 -right-2 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-75" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-300">
          XX-Commerce
        </span>
        <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 -mt-1">
          Next-Gen Shopping
        </span>
      </div>
    </Link>
  )
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const location = useLocation()

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Stunning Logo */}
            <StunningLogo />

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-primary-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <Link
                to="/products"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/products' 
                    ? 'text-primary-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Package className="h-4 w-4 inline mr-1" />
                Products
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Orders
                  </Link>
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <Link
                      to="/seller"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Settings className="h-4 w-4 inline mr-1" />
                      Seller Panel
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin-panel"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Settings className="h-4 w-4 inline mr-1" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-900">{user.name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4 inline mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 XX-Commerce. All rights reserved.</p>
            <p className="mt-2">Built with React, TypeScript, and Node.js</p>
            <p className="mt-2 text-primary-600 font-medium">Built by @PRJ_ROSAN</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 