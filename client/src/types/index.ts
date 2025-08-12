export interface User {
  id: number;
  email: string;
  name: string;
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
  price?: number;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  transaction_id?: string;
  payment_details?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'paypay' | 'bank_transfer' | 'cash_on_delivery';
  payment_details?: {
    card_number?: string;
    card_holder?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
    paypal_email?: string;
    paypay_phone?: string;
    bank_name?: string;
    account_number?: string;
  };
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
  items_summary?: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  accountType?: 'user' | 'seller';
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
} 