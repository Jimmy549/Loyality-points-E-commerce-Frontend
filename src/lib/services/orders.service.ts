import { api } from '../api';

export interface CreateOrderRequest {
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pointsToUse?: number;
  total?: number;
  paymentDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
  };
  userDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface Order {
  _id: string;
  user: string;
  items: Array<{
    productId?: string;
    product?: {
      _id: string;
      name: string;
      title?: string;
      price: number;
      images: string[];
    };
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    title?: string;
  }>;
  totalAmount: number;
  loyaltyPointsEarned?: number;
  loyaltyPointsUsed?: number;
  pointsEarned?: number;
  pointsUsed?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersService = {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      console.log('Sending order to backend:', orderData);
      
      const response = await api.post('/orders/checkout', {
        pointsToUse: orderData.pointsToUse || 0,
        shippingAddress: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postalCode: orderData.shippingAddress.zipCode,
          country: orderData.shippingAddress.country
        },
        paymentMethod: orderData.paymentMethod,
        paymentDetails: orderData.paymentDetails,
        notes: orderData.userDetails ? `Order for ${orderData.userDetails.fullName}` : 'Order placed'
      });
      
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create order failed:', error);
      throw error;
    }
  },

  async getOrders(): Promise<{ orders: Order[]; total: number }> {
    try {
      const response = await api.get('/orders');
      return {
        orders: response.data || [],
        total: response.data?.length || 0
      };
    } catch (error) {
      console.error('Get orders failed:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const localOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        return {
          orders: localOrders,
          total: localOrders.length
        };
      }
      return { orders: [], total: 0 };
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get order by ID failed:', error);
      return null;
    }
  },

  async getOrder(id: string): Promise<Order | null> {
    return this.getOrderById(id);
  },

  async cancelOrder(id: string): Promise<Order | null> {
    try {
      const response = await api.put(`/orders/${id}`, { status: 'cancelled' });
      return response.data;
    } catch (error) {
      console.error('Cancel order failed:', error);
      throw error;
    }
  }
};