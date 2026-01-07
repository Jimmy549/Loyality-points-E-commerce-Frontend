import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(userId?: string) {
    if (this.socket?.connected) {
      return;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      if (userId) {
        this.socket?.emit('join', { userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Listen for sale started notifications
  onSaleStarted(callback: (data: any) => void) {
    this.socket?.on('saleStarted', callback);
  }

  // Listen for any notification
  onNotification(callback: (data: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Remove event listener
  off(event: string) {
    this.socket?.off(event);
  }

  // Emit custom event
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default SocketService.getInstance();
