import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types'
import { api } from '../lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post<ApiResponse>('/auth/login', credentials)
          const { user, token } = response.data.data
          
          set({ user, token, isLoading: false })
          localStorage.setItem('token', token)
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Login failed', 
            isLoading: false 
          })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post<ApiResponse>('/auth/register', userData)
          const { user, token } = response.data.data
          
          set({ user, token, isLoading: false })
          localStorage.setItem('token', token)
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Registration failed', 
            isLoading: false 
          })
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
        localStorage.removeItem('token')
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
          const response = await api.get<ApiResponse>('/auth/me')
          set({ user: response.data.data, token })
        } catch (error) {
          set({ user: null, token: null })
          localStorage.removeItem('token')
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
) 