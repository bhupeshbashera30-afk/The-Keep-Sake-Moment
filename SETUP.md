# Keepsake Moments — Commerce & Admin Setup Guide

## 1. Supabase — Run Migrations

Go to **Supabase Dashboard → SQL Editor** and run these files in order:

```
supabase/migrations/001_commerce_schema.sql
supabase/seed_products.sql
```

## 2. Create an Admin User

1. Go to **Supabase → Authentication → Users → Invite user** (or use email signup).
2. After the user is created, run this in the SQL Editor — replacing the email:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## 3. Environment Variables

Add these to your `.env` (local) and Netlify environment variables:

```env
# Already present
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# New — add these
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx   # Your Razorpay test key
VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/xxxx  # Your Make.com webhook
```

## 4. Add Razorpay Script

In your `index.html`, add inside `<head>`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## 5. Make.com Webhook Setup

1. In Make.com, create a new scenario.
2. Add a **Webhooks → Custom Webhook** trigger.
3. Copy the webhook URL → paste into `VITE_MAKE_WEBHOOK_URL`.
4. Add a Telegram module to send a message when `event = order.paid`.

## 6. Admin Access

- Navigate to `yoursite.com/admin` (NOT linked anywhere in public navigation).
- Log in with your admin email/password.
- You will be redirected to `/admin/dashboard` only if your role is `admin`.

## 7. Shop

- Public shop is at `/shop`.
- Products are fetched live from Supabase.
- Cart is a sliding drawer accessible via the bag icon in the navbar.
- Checkout at `/checkout` → Razorpay → order written to Supabase → webhook fires.
