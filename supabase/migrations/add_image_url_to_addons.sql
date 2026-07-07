-- Migration: Add image_url column to site_addons table
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rjrwpulvystjkcfeldpk/sql/new

ALTER TABLE public.site_addons ADD COLUMN IF NOT EXISTS image_url TEXT;
