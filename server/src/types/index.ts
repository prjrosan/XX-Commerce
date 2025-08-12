export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  role: 'user' | 'admin' | 'seller';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  external_id?: string;
  created_at: string;
  updated_at: string;
  customization_options?: any;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'paypay' | 'bank_transfer' | 'cash_on_delivery';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  transaction_id?: string;
  payment_details?: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}

export interface WebSocketMessage {
  type: 'cart_update' | 'order_update' | 'product_update';
  data: any;
  userId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateOrderRequest {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 