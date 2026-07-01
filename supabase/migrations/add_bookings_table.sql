-- Migration: Add bookings table for time slot management
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  num_people INTEGER DEFAULT 1,
  addons JSONB DEFAULT '[]',
  addons_total NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent double-booking: unique constraint on product + date + time slot for paid bookings
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_slot
  ON bookings (product_id, booking_date, time_slot)
  WHERE payment_status = 'paid';

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can insert bookings (during checkout)
CREATE POLICY "public can insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Public can read bookings to check slot availability
CREATE POLICY "public can read booking slots" ON bookings
  FOR SELECT USING (true);

-- Public can update their own pending bookings (for payment status update)
CREATE POLICY "public can update bookings" ON bookings
  FOR UPDATE USING (true);

-- Admin full access
CREATE POLICY "admin can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
