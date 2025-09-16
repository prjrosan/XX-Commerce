import { create } from "zustand";
import { api } from "../lib/api";

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  title: string;
  price: number;
  image_url: string;
  stock_quantity: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/cart");
      if (response.data.success) {
        set({
          items: response.data.data.items,
          total: response.data.data.total,
          isLoading: false,
        });
      } else {
        set({ error: "Failed to fetch cart", isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      set({ error: "Failed to fetch cart", isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/cart", {
        product_id: productId,
        quantity,
      });
      if (response.data.success) {
        await get().fetchCart();
      } else {
        set({ error: "Failed to add item to cart", isLoading: false });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      set({ error: "Failed to add item to cart", isLoading: false });
    }
  },

  updateQuantity: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/cart/${productId}`, { quantity });
      if (response.data.success) {
        await get().fetchCart();
      } else {
        set({ error: "Failed to update quantity", isLoading: false });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({ error: "Failed to update quantity", isLoading: false });
    }
  },

  removeFromCart: async (productId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data.success) {
        await get().fetchCart();
      } else {
        set({ error: "Failed to remove item from cart", isLoading: false });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      set({ error: "Failed to remove item from cart", isLoading: false });
    }
  },

  clearCart: () => {
    set({ items: [], total: 0, error: null });
  },
}));
