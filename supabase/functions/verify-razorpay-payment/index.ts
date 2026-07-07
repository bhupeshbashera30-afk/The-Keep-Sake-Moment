import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  createHmac,
} from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_db_id,
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_db_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      console.error('RAZORPAY_KEY_SECRET not set')
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ─── CRITICAL SECURITY CHECK ─────────────────────────────────────────────
    // Razorpay's signature is HMAC-SHA256 of "order_id|payment_id" using Key Secret.
    // If this doesn't match, the payment is fake / tampered with.
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const hmac = createHmac('sha256', razorpayKeySecret)
    hmac.update(payload)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature mismatch — potential fraud attempt')
      return new Response(
        JSON.stringify({ error: 'Payment verification failed: invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Signature is valid — mark order as paid in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        payment_status: 'paid',
        order_status: 'confirmed',
      })
      .eq('id', order_db_id)

    if (dbError) {
      console.error('DB update error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Payment verified but failed to update order status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Trigger send-order-email Edge Function (fire-and-forget)
    try {
      fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: order_db_id }),
      }).catch(err => console.error('Error triggering send-order-email inside verify-razorpay-payment:', err))
    } catch (emailErr) {
      console.error('Failed to trigger email function inside verify-razorpay-payment:', emailErr)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified and order confirmed' }),
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
