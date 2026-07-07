-- Migration: Add razorpay_qr_image_url column to payment_links
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rjrwpulvystjkcfeldpk/sql/new

ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS razorpay_qr_image_url TEXT;
