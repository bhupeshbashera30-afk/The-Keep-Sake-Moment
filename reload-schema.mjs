// Reload Supabase PostgREST schema cache
// This fixes "Could not find column X in schema cache" errors

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ''
const PROJECT_REF = 'rjrwpulvystjkcfeldpk'

// NOTIFY pgrst forces PostgREST to reload its schema cache
const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: `NOTIFY pgrst, 'reload schema';` }),
})

const text = await response.text()
console.log('Schema reload status:', response.status)
console.log('Response:', text)

if (response.status === 201 || response.status === 200) {
  console.log('✅ Schema cache reloaded! PostgREST will now see all columns.')
} else {
  console.log('❌ Failed to reload schema cache')
}
