import type {
  NotificationChannel,
  NotificationResult,
  OrderNotificationPayload,
} from "@/lib/notifications/types";

export class WhatsAppChannel implements NotificationChannel {
  readonly channel = "whatsapp" as const;

  async send(payload: OrderNotificationPayload): Promise<NotificationResult> {
    console.log(
      `[WhatsAppChannel] Would send order ${payload.orderNumber} update to ${payload.customerName}`,
    );
    return {
      success: true,
    };
  }
}
