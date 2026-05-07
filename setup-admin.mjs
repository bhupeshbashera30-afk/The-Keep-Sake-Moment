/**
 * Setup admin user for Keepsake Moments
 * Uses the Supabase REST API directly to bypass RLS
 * Run: node setup-admin.mjs
 */

const SUPABASE_URL = 'https://rjrwpulvystjkcfeldpk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'

const ADMIN_EMAIL = 'admin@keepsake.com'
const ADMIN_PASSWORD = 'Admin@123'
const USER_ID = 'd6eea1b7-06d0-4b98-b0dc-d0c514e2cc6b'

console.log(`
╔════════════════════════════════════════════════════════════╗
║        KEEPSAKE MOMENTS — ADMIN SETUP INSTRUCTIONS        ║
╚════════════════════════════════════════════════════════════╝

The admin user has been created in Supabase Auth, but needs 
TWO manual steps in the Supabase Dashboard:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Confirm the admin user's email
────────────────────────────────────────
1. Go to: https://supabase.com/dashboard/project/rjrwpulvystjkcfeldpk/auth/users
2. Find user: admin@keepsake.com
3. Click the ⋮ (three dots) on the right → "Confirm user"

STEP 2: Set the user as admin in the profiles table
────────────────────────────────────────────────────
1. Go to: https://supabase.com/dashboard/project/rjrwpulvystjkcfeldpk/sql/new
2. Paste and run this SQL:

   INSERT INTO profiles (id, email, role) 
   VALUES ('${USER_ID}', '${ADMIN_EMAIL}', 'admin') 
   ON CONFLICT (id) DO UPDATE SET role = 'admin';

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After completing both steps, sign in at:
  http://localhost:5174/admin

  Email:    ${ADMIN_EMAIL}
  Password: ${ADMIN_PASSWORD}
`)
