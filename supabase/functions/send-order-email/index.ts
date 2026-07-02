import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { order_id } = await req.json()

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: order_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch order from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: order, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (dbError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shortId = order.short_id || order.id.slice(0, 8).toUpperCase()
    const items = Array.isArray(order.products) ? order.products : []
    const trackingUrl = 'https://thekeepsakemoment.in/track-order'

    // Build items HTML
    const itemsHtml = items.map((item: { name: string; qty: number; price: number }) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3e8e8;color:#4a2c2a;font-size:14px;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3e8e8;color:#4a2c2a;font-size:14px;text-align:center;">${item.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3e8e8;color:#4a2c2a;font-size:14px;text-align:right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
      </tr>`
    ).join('')

    const totalFormatted = `₹${Number(order.total).toLocaleString('en-IN')}`

    // Compose beautiful HTML email
    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#fdf8f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    
    <!-- Header -->
    <div style="text-align:center;padding:32px 20px;background:linear-gradient(135deg,#6b1d2a,#8b2840);border-radius:16px 16px 0 0;">
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;font-weight:600;">Keepsake Moments</h1>
      <p style="color:#f3d5d8;font-size:13px;margin:0;letter-spacing:1px;">ORDER CONFIRMATION</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px 28px;border-radius:0 0 16px 16px;border:1px solid #f3e8e8;border-top:none;">
      
      <p style="color:#4a2c2a;font-size:16px;margin:0 0 24px;">Dear <strong>${order.customer_name}</strong>,</p>
      <p style="color:#6b5c5a;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Thank you for your order with Keepsake Moments! We're delighted to confirm your purchase.
      </p>

      <!-- Order Reference Card -->
      <div style="background:#fdf2f0;border:1px solid #f3d5d8;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#8b6b6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Order Reference</td>
            <td style="color:#8b6b6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;text-align:right;">Status</td>
          </tr>
          <tr>
            <td style="color:#6b1d2a;font-size:20px;font-weight:700;font-family:monospace;">#${shortId}</td>
            <td style="text-align:right;">
              <span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">
                ${order.payment_status === 'paid' ? '✓ Paid' : order.payment_status.toUpperCase()}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <p style="color:#8b6b6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;font-weight:600;">Items Ordered</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 8px;">
        <thead>
          <tr style="background:#fdf2f0;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#8b6b6a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#8b6b6a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#8b6b6a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="border-top:2px solid #6b1d2a;padding:12px;display:flex;justify-content:space-between;">
        <table style="width:100%;"><tr>
          <td style="color:#4a2c2a;font-weight:700;font-size:16px;">Total</td>
          <td style="color:#6b1d2a;font-weight:700;font-size:20px;text-align:right;">${totalFormatted}</td>
        </tr></table>
      </div>

      <!-- Address -->
      ${order.address ? `
      <div style="margin:24px 0 0;padding:16px 20px;background:#f8f9fa;border-radius:12px;">
        <p style="color:#8b6b6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;font-weight:600;">Delivery Address</p>
        <p style="color:#4a2c2a;font-size:14px;line-height:1.5;margin:0;">${order.address}</p>
      </div>
      ` : ''}

      <!-- Tracking CTA -->
      <div style="text-align:center;margin:28px 0 0;">
        <p style="color:#6b5c5a;font-size:14px;margin:0 0 12px;">Track your order anytime using your Reference ID:</p>
        <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#6b1d2a,#8b2840);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:30px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
          Track My Order →
        </a>
        <p style="color:#8b6b6a;font-size:12px;margin:12px 0 0;">Tracking ID: <strong style="font-family:monospace;color:#6b1d2a;">${shortId}</strong></p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 20px;">
      <p style="color:#8b6b6a;font-size:13px;margin:0 0 4px;">With love,</p>
      <p style="color:#6b1d2a;font-size:15px;font-weight:600;margin:0;">Keepsake Moments Team</p>
      <p style="color:#b8a4a2;font-size:11px;margin:12px 0 0;">This is an automated confirmation email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Keepsake Moments <orders@thekeepsakemoment.in>',
        reply_to: 'support@thekeepsakemoment.in',
        to: [order.email],
        subject: `Order Confirmation - #${shortId} | Keepsake Moments`,
        html: htmlBody,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${order.email}`, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Edge Function error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
