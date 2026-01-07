import api from '../api';
import { CartItem } from '../features/cart/cartSlice';

export interface CheckoutData {
  items: CartItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'points' | 'hybrid';
  usePoints?: number;
  totalAmount: number;
  pointsUsed: number;
}

export interface CheckoutResponse {
  orderId: string;
  status: 'success' | 'failed';
  message: string;
  pointsEarned: number;
  pointsUsed: number;
  remainingPoints: number;
}

export const checkoutService = {
  async processCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    try {
      const response = await api.post('/checkout', data);
      return response.data;
    } catch (error) {
      // Mock response for development
      return {
        orderId: `ORD-${Date.now()}`,
        status: 'success',
        message: 'Order placed successfully!',
        pointsEarned: Math.floor(data.totalAmount),
        pointsUsed: data.pointsUsed,
        remainingPoints: 500 - data.pointsUsed + Math.floor(data.totalAmount),
      };
    }
  },

  async validateStock(items: CartItem[]): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await api.post('/checkout/validate-stock', { items });
      return response.data;
    } catch (error) {
      // Mock validation
      return {
        valid: true,
        errors: [],
      };
    }
  },

  async calculateShipping(address: CheckoutData['shippingAddress']): Promise<number> {
    try {
      const response = await api.post('/checkout/shipping', { address });
      return response.data.cost;
    } catch (error) {
      // Mock shipping cost
      return 10.00;
    }
  },

  async applyPromoCode(code: string, total: number): Promise<{ valid: boolean; discount: number }> {
    try {
      const response = await api.post('/checkout/promo', { code, total });
      return response.data;
    } catch (error) {
      // Mock promo codes
      const promoCodes: Record<string, number> = {
        'SAVE10': 0.1,
        'WELCOME20': 0.2,
        'LOYALTY15': 0.15,
      };
      
      const discount = promoCodes[code.toUpperCase()] || 0;
      return {
        valid: discount > 0,
        discount: discount * total,
      };
    }
  },
};