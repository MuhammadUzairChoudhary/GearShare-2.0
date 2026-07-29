export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'rental_update' | 'message' | 'review' | 'issue' | 'system';
  readAt: string | null;
  createdAt: string;
  data?: Record<string, string>;
}

export interface NotificationsService {
  requestPermissions(): Promise<boolean>;
  getNotifications(): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  onNotificationReceived(callback: (notification: Notification) => void): () => void;
}

class MockNotificationsService implements NotificationsService {
  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async getNotifications(): Promise<Notification[]> {
    return [];
  }

  async markAsRead(_notificationId: string): Promise<void> {
    // No-op in mock mode
  }

  async markAllAsRead(): Promise<void> {
    // No-op in mock mode
  }

  onNotificationReceived(_callback: (notification: Notification) => void): () => void {
    return () => {};
  }
}

let notificationsService: NotificationsService | null = null;

export function getNotificationsService(): NotificationsService {
  if (!notificationsService) {
    notificationsService = new MockNotificationsService();
  }
  return notificationsService;
}
