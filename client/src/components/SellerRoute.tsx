import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

interface SellerRouteProps {
  children: ReactNode
}

export default function SellerRoute({ children }: SellerRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'seller' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
} 