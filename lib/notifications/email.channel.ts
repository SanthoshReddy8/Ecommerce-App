import nodemailer from "nodemailer";
import { config } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import type {
  NotificationChannel,
  NotificationResult,
  OrderNotificationPayload,
} from "@/lib/notifications/types";

function buildOrderEmailHtml(payload: OrderNotificationPayload): string {
  const itemsHtml = payload.items
    .map(
      (item) =>
        `<li>${item.productName} x ${item.quantity} - ${formatCurrency(item.productPrice * item.quantity)}</li>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Thanks for your order, ${payload.customerName}!</h2>
      <p>Your order <strong>${payload.orderNumber}</strong> has been confirmed.</p>
      ${payload.message ? `<p>${payload.message}</p>` : ""}
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ${formatCurrency(payload.total)}</p>
      <p>Track your order anytime on the store website.</p>
    </div>
  `;
}

export class EmailChannel implements NotificationChannel {
  readonly channel = "email" as const;

  async send(payload: OrderNotificationPayload): Promise<NotificationResult> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        auth:
          config.smtp.user && config.smtp.pass
            ? { user: config.smtp.user, pass: config.smtp.pass }
            : undefined,
      });

      const info = await transporter.sendMail({
        from: config.smtp.from,
        to: payload.customerEmail,
        subject: `Order confirmed: ${payload.orderNumber}`,
        html: buildOrderEmailHtml(payload),
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) ?? undefined;
      if (previewUrl) {
        console.log(`[EmailChannel] Preview URL: ${previewUrl}`);
      }

      return { success: true, previewUrl: typeof previewUrl === "string" ? previewUrl : undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Email send failed",
      };
    }
  }
}
