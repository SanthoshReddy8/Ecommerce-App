import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { slugify } from "../lib/format";
import { config } from "../lib/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    name: "Wireless Headphones",
    description: "Noise-cancelling over-ear headphones with 30-hour battery life.",
    price: 499900,
    stockQuantity: 25,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart-rate monitor and GPS.",
    price: 899900,
    stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  },
  {
    name: "Leather Backpack",
    description: "Minimalist leather backpack with laptop compartment.",
    price: 349900,
    stockQuantity: 40,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with responsive cushioning.",
    price: 599900,
    stockQuantity: 3,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  {
    name: "Coffee Maker",
    description: "Programmable drip coffee maker with thermal carafe.",
    price: 799900,
    stockQuantity: 12,
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
  },
  {
    name: "Desk Lamp",
    description: "Adjustable LED desk lamp with warm and cool modes.",
    price: 249900,
    stockQuantity: 30,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed423f782c?w=800",
  },
  {
    name: "Yoga Mat",
    description: "Non-slip eco-friendly yoga mat, 6mm thick.",
    price: 199900,
    stockQuantity: 50,
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof speaker with deep bass.",
    price: 449900,
    stockQuantity: 2,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
  },
];

async function main() {
  await prisma.notificationLog.deleteMany();
  await prisma.shippingUpdate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.couponReservation.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();

  const passwordHash = await bcrypt.hash(config.admin.password, 10);
  await prisma.adminUser.create({
    data: {
      email: config.admin.email.toLowerCase(),
      passwordHash,
      name: "Store Admin",
    },
  });

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        slug: slugify(product.name),
        active: true,
      },
    });
  }

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.coupon.createMany({
    data: [
      {
        code: "SAVE10",
        type: "PERCENT",
        value: 10,
        maxUses: 100,
        usedCount: 0,
        validFrom: now,
        validUntil: nextMonth,
        active: true,
      },
      {
        code: "FLAT500",
        type: "FIXED",
        value: 50000,
        maxUses: 5,
        usedCount: 0,
        validFrom: now,
        validUntil: nextMonth,
        active: true,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
