import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/auth'
import { useCartStore } from './store/cart'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import ApiUnavailable from './components/ApiUnavailable'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import SellerPanel from './pages/SellerPanel'
import SellerDashboard from './pages/SellerDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import SellerRoute from './components/SellerRoute'

function App() {
  const { user, checkAuth } = useAuthStore()
  const { loadCart } = useCartStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [apiUnavailable, setApiUnavailable] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true)
        await checkAuth()
        setIsInitializing(false)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        // Check if it's an API connection error
        if (error instanceof Error && (
          error.message.includes('Network Error') || 
          error.message.includes('ERR_NETWORK') ||
          error.message.includes('fetch')
        )) {
          setApiUnavailable(true)
        } else {
          setHasError(true)
        }
        setIsInitializing(false)
      }
    }

    initializeApp()
  }, [checkAuth])

  useEffect(() => {
    if (user && !isInitializing) {
      loadCart().catch(error => {
        console.error('Failed to load cart:', error)
      })
    }
  }, [user, loadCart, isInitializing])

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen message="Initializing..." />
  }

  // Show API unavailable screen
  if (apiUnavailable) {
    return <ApiUnavailable />
  }

  // Show error screen if initialization failed
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Initialization Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't initialize the application. This might be due to network issues or server problems.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        
        <Route path="/seller" element={
          <SellerRoute>
            <SellerDashboard />
          </SellerRoute>
        } />
        
        <Route path="/admin-panel" element={
          <AdminRoute>
            <SellerPanel />
          </AdminRoute>
        } />
      </Routes>
    </Layout>
  )
}

export default App 