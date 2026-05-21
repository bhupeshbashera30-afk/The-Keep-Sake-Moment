-- Add gallery_images column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}';
