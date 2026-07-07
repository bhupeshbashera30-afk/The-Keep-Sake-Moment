-- Migration: Add payment_links table for QR payment link tracking
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rjrwpulvystjkcfeldpk/sql/new

CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_stage TEXT NOT NULL CHECK (payment_stage IN ('advance', 'planning', 'completion', 'custom')),
  razorpay_link_id TEXT,
  razorpay_short_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin can manage payment_links" ON payment_links;
CREATE POLICY "admin can manage payment_links" ON payment_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "public can read payment_links" ON payment_links;
CREATE POLICY "public can read payment_links" ON payment_links
  FOR SELECT USING (true);
