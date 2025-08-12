import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Home, Package, Settings } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'

interface LayoutProps {
  children: ReactNode
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
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">XX-Commerce</span>
            </Link>

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
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
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
          </div>
        </div>
      </footer>
    </div>
  )
} 