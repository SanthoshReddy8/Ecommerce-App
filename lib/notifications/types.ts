export type OrderNotificationPayload = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  items: Array<{
    productName: string;
    quantity: number;
    productPrice: number;
  }>;
  message?: string;
};

export type NotificationResult = {
  success: boolean;
  previewUrl?: string;
  error?: string;
};

export interface NotificationChannel {
  readonly channel: "email" | "whatsapp";
  send(payload: OrderNotificationPayload): Promise<NotificationResult>;
}
