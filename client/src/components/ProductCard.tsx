import { Link } from 'react-router-dom'
import { Product } from '../types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.id}`}>
                              <img
                        src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'}
                        alt={product.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
        <p className="text-2xl font-bold text-primary-600">
          {formatPrice(product.price)}
        </p>

      </Link>
    </div>
  )
} 