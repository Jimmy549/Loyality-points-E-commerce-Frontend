import { CartItem } from '../features/cart/cartSlice';
import { apiClient } from '../api/config';

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

export interface ApplyPromoRequest {
  code: string;
}

export interface CartResponse {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  pointsTotal: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: Array<{
    productId: {
      _id: string;
      title: string;
      price: number;
      images: string[];
      salePrice?: number;
      isOnSale?: boolean;
    };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  async getCart(): Promise<Cart | null> {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error) {
      console.warn('Cart API call failed:', error);
      return null;
    }
  },

  async addToCart(data: AddToCartData): Promise<Cart | null> {
    try {
      const response = await apiClient.post('/cart/items', {
        productId: data.productId,
        quantity: data.quantity
      });
      return response.data;
    } catch (error) {
      console.error('Add to cart API call failed:', error);
      throw error;
    }
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart | null> {
    try {
      const response = await apiClient.patch('/cart/items', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.warn('Update cart API call failed:', error);
      return null;
    }
  },

  async removeFromCart(productId: string): Promise<Cart | null> {
    try {
      const response = await apiClient.delete('/cart/items', {
        data: { productId }
      });
      return response.data;
    } catch (error) {
      console.warn('Remove from cart API call failed:', error);
      return null;
    }
  },

  async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/cart');
    } catch (error) {
      console.warn('Clear cart API call failed:', error);
    }
  },

  async applyPromoCode(code: string): Promise<{ 
    valid: boolean; 
    discount: number; 
    message: string; 
  }> {
    try {
      // This endpoint may not exist yet, keeping as mock for now
      return { valid: false, discount: 0, message: 'Promo code not found' };
    } catch (error) {
      console.warn('Apply promo API call failed:', error);
      return { valid: false, discount: 0, message: 'Failed to apply promo code' };
    }
  },

  async removePromoCode(): Promise<CartResponse | null> {
    try {
      // This endpoint may not exist yet, keeping as mock for now
      return null;
    } catch (error) {
      console.warn('Remove promo API call failed:', error);
      return null;
    }
  },

  async syncCart(localCart: CartItem[]): Promise<CartResponse | null> {
    try {
      // This endpoint may not exist yet, keeping as mock for now
      return null;
    } catch (error) {
      console.warn('Sync cart API call failed:', error);
      return null;
    }
  },
};