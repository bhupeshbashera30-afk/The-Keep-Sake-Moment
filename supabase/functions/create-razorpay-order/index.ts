import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'INR', order_db_id } = await req.json()

    if (!amount || !order_db_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, order_db_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Read Razorpay credentials from Supabase secrets (environment variables)
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not set in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Razorpay order via their REST API
    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency,
        receipt: `rcpt_${order_db_id.slice(0, 20)}`,
      }),
    })

    if (!razorpayRes.ok) {
      const errBody = await razorpayRes.text()
      console.error('Razorpay API error:', errBody)
      return new Response(
        JSON.stringify({ error: 'Failed to create Razorpay order', detail: errBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const razorpayOrder = await razorpayRes.json()

    // Save the Razorpay order ID back to our DB order row
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order_db_id)

    if (dbError) {
      console.error('DB update error:', dbError)
      // Non-fatal: still return the order ID so payment can proceed
    }

    return new Response(
      JSON.stringify({ razorpay_order_id: razorpayOrder.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
