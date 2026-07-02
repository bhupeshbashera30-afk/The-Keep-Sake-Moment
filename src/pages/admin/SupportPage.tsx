import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Search, Mail, Send, User, Clock, AlertCircle, CheckCircle, ChevronRight,
  Loader2, Tag, Calendar, Shield, Inbox, Check, X, AlertTriangle, ExternalLink, ShoppingBag
} from 'lucide-react'

// Types based on database schema
interface SupportThread {
  id: string
  customer_email: string
  customer_name: string | null
  order_id: string | null
  subject: string
  status: string // 'open', 'pending', 'waiting_for_customer', 'resolved', 'closed'
  priority: string // 'low', 'medium', 'high', 'urgent'
  last_message: string | null
  last_message_at: string
  created_at: string
  updated_at: string
}

interface SupportMessage {
  id: string
  thread_id: string
  sender_type: 'customer' | 'admin'
  sender_email: string
  message: string
  html: string | null
  attachments: any
  message_id: string | null
  created_at: string
}

interface CustomerOrder {
  id: string
  short_id: string | null
  total: number
  payment_status: string
  order_status: string
  address: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-100',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  waiting_for_customer: 'bg-purple-50 text-purple-700 border-purple-100',
  resolved: 'bg-green-50 text-green-700 border-green-100',
  closed: 'bg-gray-50 text-gray-700 border-gray-100',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-50 text-gray-600 border-gray-100',
  medium: 'bg-blue-50 text-blue-600 border-blue-100',
  high: 'bg-orange-50 text-orange-700 border-orange-100',
  urgent: 'bg-red-50 text-red-700 border-red-100 animate-pulse',
}

export function SupportPage() {
  const [threads, setThreads] = useState<SupportThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
  const [customerPhone, setCustomerPhone] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all') // 'all', 'open', 'pending', 'resolved', 'closed'
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('all') // 'all', 'today', 'week'

  // Input & loading states
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const fetchThreads = async () => {
    if (!supabase) return
    try {
      setLoadingThreads(true)
      let query = supabase!
        .from('support_threads')
        .select('*')
        .order('last_message_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      setThreads(data || [])
    } catch (err) {
      console.error('Error fetching threads:', err)
    } finally {
      setLoadingThreads(false)
    }
  }

  // Subscribe to support threads & messages realtime
  useEffect(() => {
    fetchThreads()

    if (!supabase) return
    const client = supabase!

    // Realtime channel for support threads
    const threadSubscription = client
      .channel('realtime-support-threads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_threads' },
        (payload) => {
          console.log('Realtime support thread change:', payload)
          if (payload.eventType === 'INSERT') {
            setThreads((prev) => [payload.new as SupportThread, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setThreads((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as SupportThread) : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setThreads((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(threadSubscription)
    }
  }, [])

  // Handle support message realtime updates for selected thread
  useEffect(() => {
    if (!selectedThreadId || !supabase) return
    const client = supabase!

    const messageSubscription = client
      .channel(`realtime-support-messages-${selectedThreadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `thread_id=eq.${selectedThreadId}`,
        },
        (payload) => {
          console.log('Realtime support message inserted:', payload)
          setMessages((prev) => {
            // Prevent duplicate message insertion
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new as SupportMessage]
          })
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(messageSubscription)
    }
  }, [selectedThreadId])

  // Fetch messages & customer info when thread is selected
  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([])
      setCustomerOrders([])
      setCustomerPhone(null)
      setCustomerName(null)
      return
    }

    const loadThreadDetails = async () => {
      if (!supabase) return
      setLoadingMessages(true)
      try {
        // 1. Fetch messages
        const { data: msgData, error: msgErr } = await supabase!
          .from('support_messages')
          .select('*')
          .eq('thread_id', selectedThreadId)
          .order('created_at', { ascending: true })

        if (msgErr) throw msgErr
        setMessages(msgData || [])
        scrollToBottom()

        // 2. Fetch Thread Email to query Customer Orders
        const currentThread = threads.find(t => t.id === selectedThreadId)
        if (currentThread) {
          const email = currentThread.customer_email
          
          // Fetch customer recent orders
          const { data: ordersData } = await supabase!
            .from('orders')
            .select('id,short_id,total,payment_status,order_status,address,phone,customer_name,created_at')
            .eq('email', email)
            .order('created_at', { ascending: false })

          if (ordersData && ordersData.length > 0) {
            setCustomerOrders(ordersData as CustomerOrder[])
            setCustomerPhone(ordersData[0].phone)
            setCustomerName(ordersData[0].customer_name)
          } else {
            setCustomerOrders([])
            setCustomerPhone(null)
            setCustomerName(currentThread.customer_name)
          }
        }
      } catch (err) {
        console.error('Error loading thread details:', err)
      } finally {
        setLoadingMessages(false)
      }
    }

    loadThreadDetails()
  }, [selectedThreadId, threads])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Update status or priority in DB
  const updateThreadField = async (field: 'status' | 'priority', value: string) => {
    if (!selectedThreadId || !supabase) return
    try {
      const { error } = await supabase!
        .from('support_threads')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', selectedThreadId)

      if (error) throw error

      // Optimistic update of local threads state
      setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, [field]: value } : t))
    } catch (err) {
      console.error(`Failed to update thread ${field}:`, err)
    }
  }

  // Send admin reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedThreadId || sending || !supabase) return

    setSending(true)
    try {
      const { data, error } = await supabase!.functions.invoke('reply-support-email', {
        body: {
          thread_id: selectedThreadId,
          message: replyText.trim(),
        },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      setReplyText('')
      scrollToBottom()
    } catch (err: any) {
      console.error('Error sending reply:', err)
      alert(`❌ Failed to send reply: ${err.message || 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  // Filter threads
  const filteredThreads = threads.filter(t => {
    // 1. Search term match
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      t.customer_email.toLowerCase().includes(term) ||
      (t.customer_name || '').toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term) ||
      (t.order_id || '').toLowerCase().includes(term)

    // 2. Status match
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter

    // 3. Priority match
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter

    // 4. Time match
    let matchesTime = true
    if (timeFilter === 'today') {
      const today = new Date().toDateString()
      matchesTime = new Date(t.last_message_at).toDateString() === today
    } else if (timeFilter === 'week') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      matchesTime = new Date(t.last_message_at) >= sevenDaysAgo
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesTime
  })

  const currentSelectedThread = threads.find(t => t.id === selectedThreadId)

  // Clean HTML helpers for email rendering
  const renderMessageContent = (msg: SupportMessage) => {
    if (msg.html) {
      // Return HTML safely (since it is internal admin tool, simple sanitization is okay or directly inject)
      return (
        <div 
          className="prose prose-sm max-w-none text-ink email-html-body"
          dangerouslySetInnerHTML={{ __html: msg.html }}
        />
      )
    }
    return <p className="whitespace-pre-line text-sm leading-relaxed">{msg.message}</p>
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-parchment">
      {/* ── PANEL 1: Ticket List (Left) ── */}
      <div className="flex w-80 shrink-0 flex-col border-r border-burgundy-100 bg-white">
        {/* Search */}
        <div className="p-4 border-b border-burgundy-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-burgundy-400" />
            <input
              type="text"
              placeholder="Search support inbox…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-burgundy-100 py-2 pl-9 pr-4 text-xs text-ink outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-burgundy-50 space-y-2">
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 rounded-lg border border-burgundy-100 bg-white px-2 py-1.5 text-xs text-ink focus:border-burgundy-300 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="waiting_for_customer">Waiting for Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="flex-1 rounded-lg border border-burgundy-100 bg-white px-2 py-1.5 text-xs text-ink focus:border-burgundy-300 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('all')}
              className={`flex-1 rounded-lg border py-1 text-center text-[10px] font-semibold transition ${
                timeFilter === 'all'
                  ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900'
                  : 'border-burgundy-50 bg-white text-burgundy-950/60 hover:bg-burgundy-50/50'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`flex-1 rounded-lg border py-1 text-center text-[10px] font-semibold transition ${
                timeFilter === 'today'
                  ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900'
                  : 'border-burgundy-50 bg-white text-burgundy-950/60 hover:bg-burgundy-50/50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`flex-1 rounded-lg border py-1 text-center text-[10px] font-semibold transition ${
                timeFilter === 'week'
                  ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900'
                  : 'border-burgundy-50 bg-white text-burgundy-950/60 hover:bg-burgundy-50/50'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>

        {/* List of tickets */}
        <div className="flex-1 overflow-y-auto divide-y divide-burgundy-50/40">
          {loadingThreads ? (
            <div className="flex flex-col items-center justify-center py-20 text-burgundy-400">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-xs">Loading conversations…</span>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <Inbox className="h-8 w-8 text-burgundy-200 mb-2" />
              <span className="text-xs text-burgundy-950/45 font-medium">No support tickets found</span>
            </div>
          ) : (
            filteredThreads.map(t => {
              const isActive = selectedThreadId === t.id
              const hasOrder = !!t.order_id
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedThreadId(t.id)}
                  className={`w-full text-left p-4 transition duration-150 flex flex-col gap-1.5 hover:bg-burgundy-50/20 ${
                    isActive ? 'bg-burgundy-50/60 border-l-4 border-burgundy-850' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-burgundy-950 truncate max-w-[130px]">
                      {t.customer_name || t.customer_email.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-burgundy-400 font-medium">
                      {new Date(t.last_message_at).toLocaleDateString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      } as any)}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-ink/80 truncate w-full">
                    {t.subject}
                  </span>

                  <span className="text-[11px] text-ink/50 line-clamp-2 leading-relaxed">
                    {t.last_message || '(No messages)'}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${STATUS_COLORS[t.status]}`}>
                      {t.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${PRIORITY_COLORS[t.priority]}`}>
                      {t.priority.toUpperCase()}
                    </span>
                    {hasOrder && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold border border-burgundy-100 bg-burgundy-50 text-burgundy-800 flex items-center gap-0.5">
                        <ShoppingBag className="h-2 w-2" /> Order
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── PANEL 2: Conversation View (Center) ── */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-burgundy-100">
        {currentSelectedThread ? (
          <>
            {/* Header / Ticket Actions */}
            <div className="min-h-[4.5rem] py-3 px-6 border-b border-burgundy-100 bg-white flex flex-wrap items-center justify-between gap-4 shadow-soft/20">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-burgundy-950 truncate">{currentSelectedThread.subject}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-burgundy-400 font-medium font-mono">{currentSelectedThread.customer_email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Priority Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-semibold text-burgundy-400 tracking-wider">Priority:</span>
                  <select
                    value={currentSelectedThread.priority}
                    onChange={e => updateThreadField('priority', e.target.value)}
                    className="rounded-lg border border-burgundy-100 bg-white px-2 py-1 text-xs text-ink focus:border-burgundy-300 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-semibold text-burgundy-400 tracking-wider">Status:</span>
                  <select
                    value={currentSelectedThread.status}
                    onChange={e => updateThreadField('status', e.target.value)}
                    className="rounded-lg border border-burgundy-100 bg-white px-2 py-1 text-xs text-ink focus:border-burgundy-300 outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="waiting_for_customer">Waiting for Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-parchment/30">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-burgundy-400">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <span className="text-xs">Loading messages…</span>
                </div>
              ) : (
                messages.map(msg => {
                  const isAdmin = msg.sender_type === 'admin'
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      {/* Meta */}
                      <span className="text-[10px] text-burgundy-400 font-semibold mb-1 flex items-center gap-1">
                        {isAdmin ? 'Support Team' : currentSelectedThread.customer_name || 'Customer'}
                        <span>·</span>
                        {new Date(msg.created_at).toLocaleString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                          day: '2-digit',
                          month: 'short'
                        } as any)}
                      </span>

                      {/* Content Card */}
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-soft border ${
                          isAdmin
                            ? 'bg-burgundy-850 text-white border-burgundy-800'
                            : 'bg-white text-ink border-burgundy-100/50'
                        }`}
                      >
                        {renderMessageContent(msg)}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-burgundy-100">
              <div className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${currentSelectedThread.customer_name || currentSelectedThread.customer_email} from support@thekeepsakemoment.in…`}
                  className="w-full rounded-xl border border-burgundy-100 p-3 text-xs text-ink outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50 resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-burgundy-400 font-medium flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Replies are threaded and delivered immediately
                  </span>

                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-burgundy-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-burgundy-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-parchment/10">
            <div className="bg-white p-4 rounded-full border border-burgundy-100 shadow-soft mb-3">
              <Mail className="h-8 w-8 text-burgundy-700" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg text-burgundy-950 font-semibold mb-1">Customer Support Helpdesk</h3>
            <p className="text-xs text-burgundy-950/45 max-w-[280px] leading-relaxed">
              Select a conversation from the left to view customer support emails, recent orders, and reply directly.
            </p>
          </div>
        )}
      </div>

      {/* ── PANEL 3: Customer Info & Integration (Right) ── */}
      <div className="flex w-72 shrink-0 flex-col overflow-y-auto bg-white p-6 gap-6">
        <div>
          <h3 className="text-xs uppercase font-semibold text-burgundy-400 tracking-wider mb-3">Customer Details</h3>
          {currentSelectedThread ? (
            <div className="flex flex-col gap-3 bg-burgundy-50/20 rounded-2xl border border-burgundy-100/30 p-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-burgundy-850 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {(customerName || currentSelectedThread.customer_email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-burgundy-950 truncate">{customerName || 'N/A'}</p>
                  <p className="text-[10px] text-burgundy-400 truncate">{currentSelectedThread.customer_email}</p>
                </div>
              </div>

              {customerPhone && (
                <div className="border-t border-burgundy-50 pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-burgundy-400 font-semibold uppercase">Phone:</span>
                  <span className="text-ink/80 font-medium font-mono">{customerPhone}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-burgundy-950/40 italic">No conversation selected</p>
          )}
        </div>

        {currentSelectedThread && (
          <div>
            <h3 className="text-xs uppercase font-semibold text-burgundy-400 tracking-wider mb-3">Recent Orders</h3>
            {customerOrders.length === 0 ? (
              <p className="text-xs text-burgundy-950/40 italic bg-gray-50/55 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                No orders found for this customer email.
              </p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-xl border border-burgundy-100/50 bg-white shadow-soft flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-semibold text-burgundy-900">
                        #{order.short_id || order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-burgundy-400 font-semibold">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-ink/65 font-medium">₹{Number(order.total).toLocaleString('en-IN')}</span>
                      <div className="flex gap-1">
                        <span className={`px-1 py-0.2 rounded-[4px] text-[8px] font-bold ${
                          order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                        }`}>
                          {order.payment_status.toUpperCase()}
                        </span>
                        <span className="px-1 py-0.2 rounded-[4px] text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {order.order_status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-burgundy-50/50 pt-1.5 mt-0.5 text-[9px] text-ink/40 line-clamp-1">
                      {order.address}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
