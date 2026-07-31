function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getNumberEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

export const config = {
  cartReservationTtlMinutes: getNumberEnv("CART_RESERVATION_TTL_MINUTES", 15),
  checkoutReservationTtlMinutes: getNumberEnv(
    "CHECKOUT_RESERVATION_TTL_MINUTES",
    30,
  ),
  couponReservationTtlMinutes: getNumberEnv(
    "COUPON_RESERVATION_TTL_MINUTES",
    30,
  ),
  paymentProvider: getEnv("PAYMENT_PROVIDER", "razorpay"),
  notificationChannels: getEnv("NOTIFICATION_CHANNELS", "email")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean),
  razorpay: {
    keyId: getEnv("RAZORPAY_KEY_ID", "rzp_test_dummy"),
    keySecret: getEnv("RAZORPAY_KEY_SECRET", "dummy_secret"),
  },
  smtp: {
    host: getEnv("SMTP_HOST", "localhost"),
    port: getNumberEnv("SMTP_PORT", 1025),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: getEnv("SMTP_FROM", "store@ecommerce.local"),
  },
  admin: {
    email: getEnv("ADMIN_EMAIL", "admin@store.com"),
    password: getEnv("ADMIN_PASSWORD", "changeme"),
  },
};
