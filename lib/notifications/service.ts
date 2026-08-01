import {
  NotificationChannel as NotificationChannelEnum,
  NotificationStatus,
} from "@/lib/generated/prisma/enums";
import { config } from "@/lib/config";
import { prisma } from "@/lib/db";
import { EmailChannel } from "@/lib/notifications/email.channel";
import type { NotificationChannel, OrderNotificationPayload } from "@/lib/notifications/types";
import { WhatsAppChannel } from "@/lib/notifications/whatsapp.channel";

function getEnabledChannels(): NotificationChannel[] {
  const channels: NotificationChannel[] = [];

  for (const channelName of config.notificationChannels) {
    if (channelName === "email") channels.push(new EmailChannel());
    if (channelName === "whatsapp") channels.push(new WhatsAppChannel());
  }

  return channels;
}

async function logNotification(
  orderId: string,
  channel: NotificationChannelEnum,
  payload: OrderNotificationPayload,
  result: { success: boolean; error?: string },
) {
  await prisma.notificationLog.create({
    data: {
      orderId,
      channel,
      status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      payload,
      sentAt: result.success ? new Date() : null,
      error: result.error,
    },
  });
}

async function buildPayload(orderId: string, message?: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    total: order.total,
    items: order.items.map((item: (typeof order.items)[number]) => ({
      productName: item.productName,
      quantity: item.quantity,
      productPrice: item.productPrice,
    })),
    message,
  } satisfies OrderNotificationPayload;
}

export async function sendOrderConfirmation(orderId: string) {
  const payload = await buildPayload(
    orderId,
    "We received your payment and your order is now being processed.",
  );
  const channels = getEnabledChannels();

  for (const channel of channels) {
    const result = await channel.send(payload);
    await logNotification(
      orderId,
      channel.channel === "email"
        ? NotificationChannelEnum.EMAIL
        : NotificationChannelEnum.WHATSAPP,
      payload,
      result,
    );
  }
}

export async function sendShippingUpdate(orderId: string, note?: string) {
  const payload = await buildPayload(
    orderId,
    note ?? "Your order has been shipped.",
  );
  const channels = getEnabledChannels();

  for (const channel of channels) {
    const result = await channel.send({
      ...payload,
      message: note ?? "Your order has been shipped.",
    });
    await logNotification(
      orderId,
      channel.channel === "email"
        ? NotificationChannelEnum.EMAIL
        : NotificationChannelEnum.WHATSAPP,
      payload,
      result,
    );
  }
}
