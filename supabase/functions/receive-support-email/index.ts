import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Webhook } from 'npm:svix'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'Resend API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let payloadText = ''
    let jsonBody: any = null

    // 1. Signature Verification if secret is configured
    if (webhookSecret) {
      const svixId = req.headers.get('svix-id')
      const svixTimestamp = req.headers.get('svix-timestamp')
      const svixSignature = req.headers.get('svix-signature')

      if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response(JSON.stringify({ error: 'Missing webhook signature headers' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      payloadText = await req.text()
      try {
        const wh = new Webhook(webhookSecret)
        jsonBody = wh.verify(payloadText, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        })
      } catch (err: any) {
        console.error('Svix signature verification failed:', err)
        return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else {
      // Direct JSON parsing if signature check is bypassed/disabled
      payloadText = await req.text()
      jsonBody = JSON.parse(payloadText)
    }

    console.log('Received Resend webhook body:', JSON.stringify(jsonBody))

    // Check event type
    const eventType = jsonBody?.type
    if (eventType !== 'email.received') {
      return new Response(JSON.stringify({ message: `Ignored event type: ${eventType}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get email_id from payload
    const emailId = jsonBody?.data?.email_id
    if (!emailId) {
      return new Response(JSON.stringify({ error: 'Missing email_id in webhook data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Fetch full email details from Resend receiving API
    console.log(`Fetching email details from Resend for ID: ${emailId}...`)
    const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Failed to fetch received email from Resend API:', errText)
      return new Response(JSON.stringify({ error: 'Failed to fetch email details from Resend API' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const emailDetails = await res.json()
    console.log('Fetched received email details:', JSON.stringify(emailDetails))

    const fromStr = emailDetails.from || ''
    const subject = emailDetails.subject || 'No Subject'
    const htmlContent = emailDetails.html || ''
    const textContent = emailDetails.text || ''
    const attachments = emailDetails.attachments || null
    
    // Parse headers
    const headers = emailDetails.headers || {}
    const messageId = headers['message-id'] || emailDetails.message_id || ''
    const references = headers['references'] || emailDetails.references || ''
    const inReplyTo = headers['in-reply-to'] || emailDetails.in_reply_to || ''

    // Parse sender email and name
    let senderName = ''
    let senderEmail = fromStr
    const emailMatch = fromStr.match(/(.*?)<([^>]+)>/)
    if (emailMatch) {
      senderName = emailMatch[1].replace(/["']/g, '').trim()
      senderEmail = emailMatch[2].trim()
    } else {
      senderEmail = fromStr.trim()
    }

    // Ignore mail loop or replies from our own addresses to avoid infinite loops
    if (
      senderEmail.toLowerCase() === 'support@thekeepsakemoment.in' ||
      senderEmail.toLowerCase() === 'orders@thekeepsakemoment.in'
    ) {
      return new Response(JSON.stringify({ message: 'Ignored mail loop from own support email' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Thread resolution
    let threadId = ''
    
    // Try Option A: Find message matching in_reply_to or references
    if (inReplyTo) {
      const { data: matchedMsg } = await supabase
        .from('support_messages')
        .select('thread_id')
        .eq('message_id', inReplyTo)
        .limit(1)
        .maybeSingle()

      if (matchedMsg) {
        threadId = matchedMsg.thread_id
        console.log(`Matched reply-to thread ID: ${threadId}`)
      }
    }

    if (!threadId && references) {
      // References can be space separated message IDs
      const refArray = references.split(/\s+/).filter(Boolean)
      if (refArray.length > 0) {
        const { data: matchedMsg } = await supabase
          .from('support_messages')
          .select('thread_id')
          .in('message_id', refArray)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (matchedMsg) {
          threadId = matchedMsg.thread_id
          console.log(`Matched references thread ID: ${threadId}`)
        }
      }
    }

    // Try Option B: Find active thread for customer_email
    if (!threadId) {
      const { data: activeThread } = await supabase
        .from('support_threads')
        .select('id')
        .eq('customer_email', senderEmail)
        .not('status', 'in', '("resolved","closed")')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activeThread) {
        threadId = activeThread.id
        console.log(`Matched active customer thread ID: ${threadId}`)
      }
    }

    // 4. Order linking if we are creating a new thread
    let linkedOrderId: string | null = null
    if (!threadId) {
      const { data: recentOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('email', senderEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (recentOrder) {
        linkedOrderId = recentOrder.id
        console.log(`Found recent order to link: ${linkedOrderId}`)
      }
    }

    // 5. Create thread if not found, or update existing thread stats
    const cleanMessageText = textContent || htmlContent.replace(/<[^>]*>/g, '') || ''
    const shortMessage = cleanMessageText.slice(0, 100) + (cleanMessageText.length > 100 ? '...' : '')

    if (!threadId) {
      console.log('Creating new support thread...')
      const { data: newThread, error: threadError } = await supabase
        .from('support_threads')
        .insert({
          customer_email: senderEmail,
          customer_name: senderName || null,
          subject: subject,
          order_id: linkedOrderId,
          status: 'open',
          priority: 'medium',
          last_message: shortMessage,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (threadError) throw threadError
      threadId = newThread.id
    } else {
      console.log(`Updating existing support thread: ${threadId}...`)
      const { error: updateError } = await supabase
        .from('support_threads')
        .update({
          last_message: shortMessage,
          last_message_at: new Date().toISOString(),
          status: 'open', // Re-open or set to open when customer replies
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)

      if (updateError) throw updateError
    }

    // 6. Insert new support message
    console.log('Inserting message to support_messages...')
    const { error: msgError } = await supabase
      .from('support_messages')
      .insert({
        thread_id: threadId,
        sender_type: 'customer',
        sender_email: senderEmail,
        message: cleanMessageText,
        html: htmlContent || null,
        attachments: attachments,
        message_id: messageId || null,
        references: references || null,
        in_reply_to: inReplyTo || null,
      })

    if (msgError) throw msgError

    return new Response(JSON.stringify({ success: true, thread_id: threadId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Support email webhook parser error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
