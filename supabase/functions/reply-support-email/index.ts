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

    const { thread_id, message } = await req.json()

    if (!thread_id || !message) {
      return new Response(JSON.stringify({ error: 'Missing thread_id or message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch thread details
    const { data: thread, error: threadErr } = await supabase
      .from('support_threads')
      .select('*')
      .eq('id', thread_id)
      .single()

    if (threadErr || !thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch last customer message to set thread headers
    const { data: lastCustomerMsg } = await supabase
      .from('support_messages')
      .select('*')
      .eq('thread_id', thread_id)
      .eq('sender_type', 'customer')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastMessageId = lastCustomerMsg?.message_id || ''
    const previousReferences = lastCustomerMsg?.references || ''
    const referencesString = previousReferences 
      ? `${previousReferences} ${lastMessageId}`.trim()
      : lastMessageId

    // Ensure subject has "Re: " prefix if not present
    let emailSubject = thread.subject
    if (!emailSubject.toLowerCase().startsWith('re:')) {
      emailSubject = `Re: ${emailSubject}`
    }

    // Send email via Resend
    const headers: Record<string, string> = {}
    if (lastMessageId) {
      headers['In-Reply-To'] = lastMessageId
      headers['References'] = referencesString
    }

    console.log(`Sending support email to ${thread.customer_email} with subject: ${emailSubject}`)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Keepsake Moments Support <support@thekeepsakemoment.in>',
        to: [thread.customer_email],
        subject: emailSubject,
        text: message,
        html: `<div style="font-family: sans-serif; font-size: 14px; color: #4a2c2a; line-height: 1.5; max-width: 600px;">
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: 0; border-top: 1px solid #f3e8e8; margin: 24px 0;" />
          <p style="color: #8b6b6a; font-size: 12px;">Warm regards,</p>
          <p style="color: #6b1d2a; font-weight: 600; font-size: 14px; margin-top: 4px;">Keepsake Moments Support</p>
        </div>`,
        headers: headers,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error('Resend send email error:', resData)
      return new Response(JSON.stringify({ error: 'Failed to send email via Resend API', details: resData }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const newMessageId = resData.id // Resend email ID

    // Insert admin reply to messages
    const { error: msgInsertErr } = await supabase
      .from('support_messages')
      .insert({
        thread_id: thread_id,
        sender_type: 'admin',
        sender_email: 'support@thekeepsakemoment.in',
        message: message,
        message_id: newMessageId ? `<${newMessageId}@resend.dev>` : null,
        in_reply_to: lastMessageId || null,
        references: referencesString || null,
      })

    if (msgInsertErr) {
      console.error('Error inserting admin message:', msgInsertErr)
    }

    // Update thread last message details & change status to 'waiting_for_customer'
    const shortMessage = message.slice(0, 100) + (message.length > 100 ? '...' : '')
    const { error: threadUpdateErr } = await supabase
      .from('support_threads')
      .update({
        last_message: `Admin: ${shortMessage}`,
        last_message_at: new Date().toISOString(),
        status: 'waiting_for_customer',
        updated_at: new Date().toISOString(),
      })
      .eq('id', thread_id)

    if (threadUpdateErr) {
      console.error('Error updating thread:', threadUpdateErr)
    }

    return new Response(JSON.stringify({ success: true, message_id: newMessageId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Reply support email error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
