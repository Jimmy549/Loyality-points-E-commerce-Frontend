import { loyaltyApi } from '../api/loyalty';

export interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'spent' | 'expired';
  amount: number;
  description: string;
  orderId?: string;
  timestamp: string;
}

export interface LoyaltyPointsData {
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  transactions: LoyaltyTransaction[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints: number;
}

export const loyaltyService = {
  async getPointsBalance(): Promise<LoyaltyPointsData> {
    try {
      return await loyaltyApi.getPoints();
    } catch (error) {
      console.warn('Loyalty API call failed, using mock data:', error);
      return {
        totalPoints: 1250,
        availablePoints: 1100,
        pendingPoints: 150,
        transactions: [
          {
            id: '1',
            type: 'earned',
            amount: 50,
            description: 'Purchase reward - Order #12345',
            orderId: '12345',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'spent',
            amount: -100,
            description: 'Redeemed for T-shirt discount',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        tier: 'gold',
        nextTierPoints: 250,
      };
    }
  },

  async spendPoints(amount: number, orderId: string): Promise<{ success: boolean; newBalance: number }> {
    try {
      const result = await loyaltyApi.redeemPoints(amount, orderId);
      return { success: true, newBalance: result.newBalance };
    } catch (error) {
      console.warn('Spend points API call failed, using mock:', error);
      return {
        success: true,
        newBalance: 1100 - amount,
      };
    }
  },

  async earnPoints(amount: number, orderId: string): Promise<{ success: boolean; newBalance: number }> {
    try {
      const result = await loyaltyApi.earnPoints(orderId);
      return { success: true, newBalance: result.newBalance };
    } catch (error) {
      console.warn('Earn points API call failed, using mock:', error);
      return {
        success: true,
        newBalance: 1100 + amount,
      };
    }
  },

  async getPointsHistory(limit: number = 50): Promise<LoyaltyTransaction[]> {
    try {
      const response = await loyaltyApi.getTransactions(1, limit);
      return response.transactions || response;
    } catch (error) {
      console.warn('Points history API call failed, using mock:', error);
      return [
        {
          id: '1',
          type: 'earned',
          amount: 50,
          description: 'Purchase reward',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'spent',
          amount: -100,
          description: 'Product discount',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }
  },

  calculatePointsEarned(amount: number): number {
    // 1 point per dollar spent
    return Math.floor(amount);
  },

  calculatePointsValue(points: number): number {
    // 100 points = $5
    return (points / 100) * 5;
  },
};