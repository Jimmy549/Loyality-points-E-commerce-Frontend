import { notificationsApi } from '../api/notifications';

export interface Notification {
  id: string;
  type: 'sale' | 'order' | 'points' | 'general';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const notificationsService = {
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number }> {
    try {
      return await notificationsApi.getNotifications(page, limit);
    } catch (error) {
      console.warn('Notifications API call failed, using mock data:', error);
      return {
        notifications: [
          {
            id: '1',
            type: 'sale',
            title: 'Flash Sale Started!',
            message: '50% off on selected items. Limited time offer!',
            read: false,
            actionUrl: '/shop',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'points',
            title: 'Points Earned!',
            message: 'You earned 50 loyalty points from your recent purchase!',
            read: false,
            actionUrl: '/profile',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        total: 2
      };
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      console.warn('Mark as read API call failed:', error);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await notificationsApi.markAllAsRead();
    } catch (error) {
      console.warn('Mark all as read API call failed:', error);
    }
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      await notificationsApi.deleteNotification(id);
    } catch (error) {
      console.warn('Delete notification API call failed:', error);
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const result = await notificationsApi.getUnreadCount();
      return result.count || 0;
    } catch (error) {
      console.warn('Get unread count API call failed:', error);
      return 0;
    }
  }
};