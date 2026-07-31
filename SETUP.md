# Setup Instructions - ShopFlow E-Commerce

All code is complete and type-safe. Follow these steps to get the app running locally.

## Step 1: Start Docker Desktop

**Windows:**
1. Open Windows Start Menu
2. Search for "Docker Desktop"
3. Click to launch
4. Wait for it to fully start (check system tray icon)

**Verify Docker is running:**
```bash
docker --version
docker ps
```

## Step 2: Start Database & Email Services

```bash
cd c:\Ecommerce
docker compose up -d
```

This starts:
- **PostgreSQL** on localhost:5432 (user: ecommerce, pass: ecommerce)
- **Mailhog** SMTP on localhost:1025 and web UI on localhost:8025

**Verify services are running:**
```bash
docker compose ps
```

Should show 2 healthy containers.

## Step 3: Generate Database Schema

```bash
npm run db:migrate
```

This creates all tables, enums, indexes from `prisma/schema.prisma`.

Expected output:
```
Your database is now in sync with your schema.
```

## Step 4: Seed Initial Data

```bash
npm run db:seed
```

This populates:
- **Admin User:** admin@store.com / changeme
- **8 Products:** Wireless Headphones, Smart Watch, Running Shoes, etc.
- **2 Coupons:** SAVE10 (10% off, 100 uses), FLAT500 (₹500 off, 5 uses)

## Step 5: Start Development Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 16.2.11
  - Ready in 2.5s
  - Listening on 0.0.0.0:3000
  - Listening on [::1]:3000
```

## Access the App

| Section | URL | Credentials |
|---------|-----|-------------|
| Storefront | http://localhost:3000 | — |
| Admin Panel | http://localhost:3000/admin/login | admin@store.com / changeme |
| Email Preview | http://localhost:8025 | — |
| Prisma Studio | `npm run db:studio` | — |

## Quick Test Flow

1. **Open** http://localhost:3000
2. **Add product** to bag → See 15-min expiry timer
3. **Go to checkout** → Apply coupon "SAVE10"
4. **Complete payment** → Use dummy Razorpay modal
5. **View order** → See confirmation and tracking page
6. **Check email** → Open http://localhost:8025, see order confirmation

## Database Issues?

**Connection failed:**
```bash
# Check if database is running
docker compose logs postgres

# Restart if needed
docker compose restart postgres
```

**Migration lock error:**
```bash
# Reset Prisma migrations (full reset)
npx prisma migrate reset --force
npm run db:seed
```

**Admin login not working:**
```bash
# Re-seed the database
npm run db:seed
```

## What's Included

✅ **12+ API Routes** — Cart, checkout, payments, coupons, orders, admin  
✅ **Stock Reservation System** — Postgres SELECT FOR UPDATE locking  
✅ **Coupon Management** — Hold with usage tracking  
✅ **Payment Abstraction** — Razorpay (dummy) + Stripe (stub)  
✅ **Email Notifications** — Nodemailer + Mailhog  
✅ **Admin Dashboard** — Manage products, coupons, orders  
✅ **Authentication** — NextAuth credentials provider  
✅ **Cleanup Job** — Cron releases expired reservations every 60s  
✅ **Type Safety** — Zero TypeScript errors  

## Next Steps (After Starting)

1. Test the storefront flows (add to bag, checkout, etc.)
2. Admin panel: Manage products and adjust stock
3. Implement Stripe provider (see [Swap Payment Providers](#-swap-payment-providers) in README)
4. Add WhatsApp notifications (see [Add WhatsApp Notifications](#-notification-channels) in README)
5. Deploy to production (Vercel, Railway, Heroku)

---

**All code is ready — just start Docker and follow the steps above! 🚀**
