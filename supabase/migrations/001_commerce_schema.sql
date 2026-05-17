-- ============================================================
-- Keepsake Moments — Commerce Schema Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  price       numeric(10,2) NOT NULL DEFAULT 0,
  image_url   text,
  category    text NOT NULL DEFAULT 'hampers'
              CHECK (category IN (
                'hampers',
                'flowers',
                'crochets',
                'photobooth-rental',
                'dinner-night',
                'event-and-decor',
                'birthday',
                'anniversary',
                'proposal',
                'corporate',
                'special-occasion'
              )),
  stock       integer NOT NULL DEFAULT 999,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name        text NOT NULL,
  email                text NOT NULL,
  phone                text NOT NULL,
  address              text,
  products             jsonb NOT NULL DEFAULT '[]',
  total                numeric(10,2) NOT NULL DEFAULT 0,
  payment_status       text NOT NULL DEFAULT 'pending'
                       CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status         text NOT NULL DEFAULT 'processing'
                       CHECK (order_status IN ('processing','confirmed','shipped','delivered','cancelled')),
  razorpay_payment_id  text,
  razorpay_order_id    text,
  created_at           timestamptz DEFAULT now() NOT NULL
);

-- Profiles (for admin role check)
CREATE TABLE IF NOT EXISTS profiles (
  id    uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  role  text NOT NULL DEFAULT 'user'
        CHECK (role IN ('user','admin'))
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
-- Products: admin write
CREATE POLICY "admin_write_products" ON products
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Orders: anyone can insert (checkout)
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
-- Orders: anyone can update own (payment handler)
CREATE POLICY "public_update_orders" ON orders FOR UPDATE USING (true);
-- Orders: admin can read all
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Profiles: self
CREATE POLICY "self_read_profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Profiles: admin read all
CREATE POLICY "admin_read_profiles" ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
