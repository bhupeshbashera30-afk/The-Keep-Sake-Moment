// Add all missing columns to the orders table in one migration

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ''
const PROJECT_REF = 'rjrwpulvystjkcfeldpk'

const sql = `
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS products jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
`

const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: sql }),
})

const text = await response.text()
console.log('Migration status:', response.status)
console.log('Response:', text)

if (response.status === 201 || response.status === 200) {
  console.log('✅ All missing columns added!')

  // Also reload schema cache
  const reload = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    body: JSON.stringify({ query: `NOTIFY pgrst, 'reload schema';` }),
  })
  console.log('Schema reload status:', reload.status)
  console.log('✅ Schema cache reloaded!')
} else {
  console.log('❌ Migration failed')
}
