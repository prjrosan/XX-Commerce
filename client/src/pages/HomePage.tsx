import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, Truck, CreditCard, Users, Globe } from 'lucide-react'
import { Product, ApiResponse, ProductsResponse } from '../types'
import { api } from '../lib/api'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadFeaturedProducts = async () => {
      try {
        const response = await api.get<ApiResponse<ProductsResponse>>('/products?limit=8')
        if (response.data.data) {
          setFeaturedProducts(response.data.data.products)
        }
      } catch (error) {
        console.error('Failed to load featured products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Midnight Sky Background */}
      <div className="absolute inset-0">
        {/* Stars */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:50px_50px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:100px_100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_3px_3px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:150px_150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Shooting Stars */}
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-40 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '5s'}}></div>
        <div className="absolute top-60 left-2/3 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '7s'}}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl transition-all duration-1000 ${mounted ? 'translate-x-0 translate-y-0' : 'translate-x-20 translate-y-20'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl transition-all duration-1000 delay-300 ${mounted ? 'translate-x-0 translate-y-0' : '-translate-x-20 -translate-y-20'}`}></div>
        <div className={`absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl transition-all duration-1000 delay-500 ${mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 left-20 transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Sparkles className="w-8 h-8 text-blue-400/60 animate-pulse" />
        </div>
        <div className={`absolute top-32 right-32 transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <TrendingUp className="w-6 h-6 text-purple-400/60 animate-bounce" />
        </div>
        <div className={`absolute bottom-32 left-32 transition-all duration-1000 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Shield className="w-7 h-7 text-green-400/60 animate-pulse" />
        </div>
        <div className={`absolute bottom-20 right-20 transition-all duration-1000 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Zap className="w-5 h-5 text-cyan-400/60 animate-bounce" />
        </div>
      </div>

      <div className="relative z-10 space-y-16">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/50 to-indigo-900/50"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className={`transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                <Sparkles className="w-4 h-4 text-blue-300 mr-2" />
                <span className="text-blue-100 text-sm font-medium">Next-Gen E-Commerce Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                Welcome to{' '}
                <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  XX-Commerce
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Discover amazing products with real-time updates, seamless shopping experience, and cutting-edge technology
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Link
                  to="/products"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border border-blue-400/30"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  to="/register"
                  className="group border-2 border-blue-400/50 text-blue-100 hover:bg-blue-400/10 hover:border-blue-300 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  <span>Get Started</span>
                  <Sparkles className="ml-2 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">1000+</div>
                <div className="text-blue-200 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-blue-200 text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">99%</div>
                <div className="text-blue-200 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className={`max-w-7xl mx-auto transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6">
                Why Choose XX-Commerce?
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                Experience the future of online shopping with our cutting-edge features and technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-slate-800/70">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Lightning Fast</h3>
                <p className="text-blue-200 leading-relaxed">Ultra-fast loading times and seamless navigation for the best user experience</p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-slate-800/70">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Secure & Safe</h3>
                <p className="text-blue-200 leading-relaxed">Bank-level security with encrypted transactions and data protection</p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-slate-800/70">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Fast Delivery</h3>
                <p className="text-blue-200 leading-relaxed">Quick shipping and real-time tracking for all your orders</p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-slate-800/70">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Multiple Payments</h3>
                <p className="text-blue-200 leading-relaxed">Multiple payment methods with bank-level security and encryption</p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-slate-800/70">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Community</h3>
                <p className="text-blue-200 leading-relaxed">Join our growing community of shoppers and sellers worldwide</p>
              </div>

              <div className="group text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-700/50 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:bg-slate-800/70">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Global Reach</h3>
                <p className="text-blue-200 leading-relaxed">Shop from anywhere in the world with our international platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className={`max-w-7xl mx-auto transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                  Featured Products
                </h2>
                <p className="text-xl text-blue-200">Discover our handpicked selection of premium products</p>
              </div>
              <Link
                to="/products"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center border border-blue-400/30"
              >
                View All
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-700/50 animate-pulse">
                    <div className="bg-gradient-to-br from-slate-600 to-slate-700 h-48 rounded-2xl mb-6"></div>
                    <div className="bg-gradient-to-br from-slate-600 to-slate-700 h-6 rounded-xl mb-3"></div>
                    <div className="bg-gradient-to-br from-slate-600 to-slate-700 h-5 rounded-xl w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-gradient-to-br from-slate-800/80 via-purple-900/80 to-indigo-900/80 rounded-3xl p-12 shadow-2xl relative overflow-hidden border border-slate-700/50 backdrop-blur-xl">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Shopping?
                </h2>
                <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers and experience the future of e-commerce today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border border-blue-400/30"
                  >
                    <span>Create Account</span>
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/products"
                    className="border-2 border-blue-400/50 text-blue-100 hover:bg-blue-400/10 hover:border-blue-300 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                  >
                    <span>Browse Products</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
