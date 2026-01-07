import { apiClient } from './config';

export const loyaltyApi = {
  getPoints: async () => {
    const response = await apiClient.get('/loyalty/points');
    return response.data;
  },

  getTransactions: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/loyalty/transactions', {
      params: { page, limit }
    });
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/loyalty/settings');
    return response.data;
  },

  earnPoints: async (orderId: string) => {
    const response = await apiClient.post('/loyalty/earn', { orderId });
    return response.data;
  },

  redeemPoints: async (points: number, orderId: string) => {
    const response = await apiClient.post('/loyalty/redeem', { points, orderId });
    return response.data;
  }
};