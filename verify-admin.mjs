import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rjrwpulvystjkcfeldpk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndwdWx2eXN0amtjZmVsZHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDk2MjIsImV4cCI6MjA5MzI4NTYyMn0.DifCVn_QgyabDvken0f7J2aKsonRrzrHcTdqBxuWNSo'
)

async function test() {
  // Sign in as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@keepsake.com',
    password: 'Admin@123',
  })

  if (authError) {
    console.error('Auth failed:', authError.message)
    return
  }
  console.log('✅ Signed in as admin:', authData.user.id)

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle()
  console.log('Profile:', profile, 'Error:', profileError?.message)

  // Query orders (like the dashboard does)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id,customer_name,total,payment_status,order_status,created_at')
    .order('created_at', { ascending: false })
  console.log('Orders:', orders?.length ?? 0, 'Error:', ordersError?.message ?? 'none')
  if (orders) console.log('Orders data:', JSON.stringify(orders, null, 2))

  // Query products (like the dashboard does)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id,is_active')
  console.log('Products:', products?.length ?? 0, 'Error:', productsError?.message ?? 'none')

  await supabase.auth.signOut()
}

test().catch(console.error)
