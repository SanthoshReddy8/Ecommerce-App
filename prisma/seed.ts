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
  {
    name: "Mechanical Keyboard",
    description: "Compact wireless mechanical keyboard with tactile switches and warm backlighting.",
    price: 749900,
    stockQuantity: 18,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
  },
  {
    name: "Studio Headphones",
    description: "Reference-grade wired headphones tuned for detailed, balanced listening.",
    price: 999900,
    stockQuantity: 9,
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
  },
  {
    name: "Minimal Desk Chair",
    description: "Ergonomic task chair with breathable mesh and adjustable lumbar support.",
    price: 1599900,
    stockQuantity: 7,
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800",
  },
  {
    name: "Travel Camera",
    description: "Pocket-sized mirrorless camera for sharp everyday photos and cinematic video.",
    price: 4299900,
    stockQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
  },
  {
    name: "Insulated Bottle",
    description: "Double-wall stainless steel bottle that keeps drinks cold for 24 hours.",
    price: 179900,
    stockQuantity: 45,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
  },
  {
    name: "Canvas Weekender",
    description: "Structured carry-on duffel with leather trims and a dedicated shoe compartment.",
    price: 649900,
    stockQuantity: 14,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
  },
  {
    name: "Ceramic Pour Over Set",
    description: "Hand-finished dripper and carafe set for a clean, precise morning brew.",
    price: 329900,
    stockQuantity: 22,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
  },
  {
    name: "Portable Projector",
    description: "Full HD smart projector with auto-focus and room-filling stereo sound.",
    price: 2499900,
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(config.admin.password, 10);
  await prisma.adminUser.upsert({
    where: { email: config.admin.email.toLowerCase() },
    update: {
      passwordHash,
      name: "Store Admin",
    },
    create: {
      email: config.admin.email.toLowerCase(),
      passwordHash,
      name: "Store Admin",
    },
  });

  for (const product of products) {
    const slug = slugify(product.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        ...product,
        active: true,
      },
      create: { ...product, slug, active: true },
    });
  }

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const coupons = [
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
  ] as const;

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        type: coupon.type,
        value: coupon.value,
        maxUses: coupon.maxUses,
        validUntil: coupon.validUntil,
        active: true,
      },
      create: coupon,
    });
  }

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
