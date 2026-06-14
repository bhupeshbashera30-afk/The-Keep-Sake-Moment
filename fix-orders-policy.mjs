import { createClient } from '@supabase/supabase-js'

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ''
const PROJECT_REF = 'rjrwpulvystjkcfeldpk'

// Fix 1: Add public SELECT policy on orders so insert().select().single() works
const sql = `CREATE POLICY "public can read own orders" ON orders FOR SELECT USING (true);`

const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: sql }),
})

const text = await response.text()
console.log('Status:', response.status)
console.log('Response:', text)

if (response.status === 201 || response.status === 200) {
  console.log('✅ Policy created successfully!')
} else {
  // Might already exist — try alternative
  const sql2 = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'public can read own orders'
      ) THEN
        CREATE POLICY "public can read own orders" ON orders FOR SELECT USING (true);
      END IF;
    END
    $$;
  `
  const r2 = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: sql2 }),
  })
  const t2 = await r2.text()
  console.log('Fallback Status:', r2.status)
  console.log('Fallback Response:', t2)
}
