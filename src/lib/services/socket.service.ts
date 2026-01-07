"use client";

import { io, Socket } from 'socket.io-client';
import { addNotification } from '../features/notifications/notificationSlice';
import { AppDispatch } from '../store';

class SocketService {
  private socket: Socket | null = null;
  private dispatch: AppDispatch | null = null;

  connect(userId: string, dispatch: AppDispatch) {
    if (typeof window === 'undefined') return;
    
    this.dispatch = dispatch;
    
    try {
      this.socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/notifications`, {
        auth: {
          userId,
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('sale_notification', (data) => {
        this.dispatch?.(addNotification({
          type: 'sale',
          title: 'New Sale Alert!',
          message: data.message,
          actionUrl: data.productUrl,
        }));
      });

      this.socket.on('order_update', (data) => {
        this.dispatch?.(addNotification({
          type: 'order',
          title: 'Order Update',
          message: data.message,
          actionUrl: `/orders/${data.orderId}`,
        }));
      });

      this.socket.on('points_earned', (data) => {
        this.dispatch?.(addNotification({
          type: 'points',
          title: 'Points Earned!',
          message: `You earned ${data.points} loyalty points!`,
          actionUrl: '/profile',
        }));
      });

    } catch (error) {
      console.log('Socket connection failed, using mock notifications');
      // Simulate notifications for development
      this.simulateNotifications();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private simulateNotifications() {
    if (!this.dispatch) return;

    // Simulate sale notification after 5 seconds
    setTimeout(() => {
      this.dispatch?.(addNotification({
        type: 'sale',
        title: 'Flash Sale Started!',
        message: '50% off on selected items. Limited time offer!',
        actionUrl: '/shop',
      }));
    }, 5000);

    // Simulate points notification after 10 seconds
    setTimeout(() => {
      this.dispatch?.(addNotification({
        type: 'points',
        title: 'Bonus Points!',
        message: 'You earned 100 bonus loyalty points!',
        actionUrl: '/profile',
      }));
    }, 10000);
  }

  // Admin functions
  broadcastSaleNotification(saleData: { message: string; productUrl: string }) {
    if (this.socket) {
      this.socket.emit('broadcast_sale', saleData);
    }
  }

  sendOrderUpdate(orderId: string, message: string) {
    if (this.socket) {
      this.socket.emit('order_update', { orderId, message });
    }
  }
}

export const socketService = new SocketService();