-- Add razorpay_order_id column to orders table
-- This stores the Razorpay-generated order ID (distinct from our DB order ID)
-- It is created server-side and used to verify payment signatures

ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
