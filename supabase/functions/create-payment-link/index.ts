import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Read Razorpay credentials
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not set in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

    // ── SYNC ACTION ──
    if (body.action === 'sync') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Fetch pending Razorpay links
      const { data: pendingLinks, error: fetchErr } = await supabase
        .from('payment_links')
        .select('*')
        .eq('status', 'pending')
        .not('razorpay_link_id', 'is', null)

      if (fetchErr) throw fetchErr

      const updated = []
      if (pendingLinks && pendingLinks.length > 0) {
        for (const link of pendingLinks) {
          try {
            const res = await fetch(`https://api.razorpay.com/v1/payment_links/${link.razorpay_link_id}`, {
              method: 'GET',
              headers: {
                Authorization: `Basic ${basicAuth}`,
              },
            })
            if (res.ok) {
              const rzpData = await res.json()
              if (rzpData.status === 'paid') {
                // Update in DB
                const { error: updErr } = await supabase
                  .from('payment_links')
                  .update({ status: 'paid' })
                  .eq('id', link.id)
                if (!updErr) {
                  // Also mark the related booking payment status if it has one
                  if (link.booking_id) {
                    await supabase
                      .from('bookings')
                      .update({ payment_status: 'paid' })
                      .eq('id', link.booking_id)
                  }
                  updated.push({ id: link.id, status: 'paid' })
                }
              }
            }
          } catch (err) {
            console.error(`Error syncing link ${link.id}:`, err)
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, updated }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── CREATE ACTION (original behavior) ──
    const { amount, customer_name, email, phone, description, booking_id, order_id, payment_stage } = body

    if (!amount || !customer_name || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, customer_name, description' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amountInPaise = Math.round(amount * 100)

    // 1. Create Razorpay Payment Link
    let razorpayLink: any = null
    try {
      const linkRes = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          description: description.slice(0, 200),
          customer: {
            name: customer_name,
            email: email || undefined,
            contact: phone || undefined,
          },
          notify: {
            sms: !!phone,
            email: !!email,
          },
          reminder_enable: true,
          callback_url: '',
          callback_method: '',
        }),
      })

      if (linkRes.ok) {
        razorpayLink = await linkRes.json()
      } else {
        const errText = await linkRes.text()
        console.error('Razorpay Link creation failed:', errText)
      }
    } catch (err) {
      console.error('Error creating Razorpay link:', err)
    }

    // 2. Create Razorpay QR Code
    let razorpayQr: any = null
    try {
      const qrRes = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          type: 'upi_qr',
          name: 'Keepsake Moments',
          usage: 'single_use',
          fixed_amount: true,
          payment_amount: amountInPaise,
          description: description.slice(0, 30),
        }),
      })

      if (qrRes.ok) {
        razorpayQr = await qrRes.json()
      } else {
        const errText = await qrRes.text()
        console.error('Razorpay QR creation failed:', errText)
      }
    } catch (err) {
      console.error('Error creating Razorpay QR:', err)
    }

    if (!razorpayLink && !razorpayQr) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate payment resources from Razorpay' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save to payment_links table
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const insertData: Record<string, unknown> = {
      amount,
      payment_stage: payment_stage || 'custom',
      razorpay_link_id: razorpayLink?.id || null,
      razorpay_short_url: razorpayLink?.short_url || null,
      razorpay_qr_image_url: razorpayQr?.image_url || null,
      status: 'pending',
    }
    if (booking_id) insertData.booking_id = booking_id
    if (order_id) insertData.order_id = order_id

    const { error: dbError } = await supabase
      .from('payment_links')
      .insert(insertData)

    if (dbError) {
      console.error('DB insert error for payment_link:', dbError)
    }

    return new Response(
      JSON.stringify({
        link_id: razorpayLink?.id || null,
        short_url: razorpayLink?.short_url || null,
        qr_image_url: razorpayQr?.image_url || null,
        amount: amount,
        status: 'pending',
      }),
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
