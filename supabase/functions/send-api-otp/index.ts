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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Resend API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min expiry

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert OTP in DB
    const { error: dbErr } = await supabase
      .from('api_otps')
      .insert({
        code,
        expires_at: expiresAt,
        used: false,
      })

    if (dbErr) {
      console.error('Error inserting OTP in DB:', dbErr)
      return new Response(JSON.stringify({ error: 'Failed to generate verification code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Generated OTP code: ${code} (expires: ${expiresAt})`)

    // Send email to thekeepsakemoment@gmail.com
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Keepsake Moments Support <support@thekeepsakemoment.in>',
        to: ['thekeepsakemoment@gmail.com'],
        subject: 'Keepsake Moments — API Verification Code',
        text: `Your API portal verification code is: ${code}. This code is valid for 5 minutes.`,
        html: `<div style="font-family: sans-serif; font-size: 14px; color: #4a2c2a; line-height: 1.6; max-width: 600px; padding: 20px; border: 1px solid #f3e8e8; border-radius: 12px; background-color: #fdf8f6;">
          <h2 style="color: #6b1d2a; margin-top: 0;">API Access Verification</h2>
          <p>A request was made to access the secure API Keys configuration portal on the Keepsake Moments Admin Dashboard.</p>
          <p>Please use the following 6-digit verification code to complete your login:</p>
          <div style="background-color: #ffffff; border: 1px solid #f3d5d8; border-radius: 8px; padding: 12px 24px; font-family: monospace; font-size: 28px; font-weight: 700; color: #6b1d2a; letter-spacing: 4px; text-align: center; margin: 20px 0; width: max-content; margin-left: auto; margin-right: auto;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #8b6b6a;">This code will expire in 5 minutes. If you did not make this request, please secure your account immediately.</p>
        </div>`,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error('Failed to send email via Resend API:', resData)
      return new Response(JSON.stringify({ error: 'Failed to send verification email' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, message: 'Verification email sent' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Send OTP error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
