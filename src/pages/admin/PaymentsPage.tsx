import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, RefreshCw, CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Transaction {
  id: string
  short_id: string | null
  customer_name: string
  email: string
  total: number
  payment_status: string
  order_status: string
  razorpay_payment_id: string | null
  created_at: string
}

export function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [successfulCount, setSuccessfulCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  const fetchTransactions = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase!
        .from('orders')
        .select('id,short_id,customer_name,email,total,payment_status,order_status,razorpay_payment_id,created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      const txList = data as Transaction[]
      setTransactions(txList || [])

      // Calculate stats
      let revenue = 0
      let paid = 0
      let pending = 0
      txList?.forEach(tx => {
        if (tx.payment_status === 'paid') {
          revenue += Number(tx.total)
          paid++
        } else if (tx.payment_status === 'pending') {
          pending++
        }
      })
      setTotalRevenue(revenue)
      setSuccessfulCount(paid)
      setPendingCount(pending)
    } catch (err) {
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.razorpay_payment_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.short_id || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || tx.payment_status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-burgundy-950">Payments & Transactions</h1>
          <p className="text-xs text-burgundy-400 mt-1">Monitor sales, payment statuses, and transaction details.</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Rev Card */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-6 shadow-soft flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Paid Count Card */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-6 shadow-soft flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Paid Orders</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{successfulCount}</h3>
          </div>
        </div>

        {/* Pending Count Card */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-6 shadow-soft flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-soft overflow-hidden">
        {/* Tool Bar */}
        <div className="p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or Razorpay ID…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-burgundy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-50"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-burgundy-300 outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="h-8 w-8 animate-spin mb-2" />
              <span className="text-sm">Loading transactions…</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <CreditCard className="h-10 w-10 mx-auto text-gray-200 mb-2" />
              <span className="text-sm">No transactions found</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 text-xs">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Razorpay ID</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/40">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-xs text-burgundy-900">
                      #{tx.short_id || tx.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{tx.customer_name}</div>
                      <div className="text-xs text-gray-400">{tx.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {tx.razorpay_payment_id || <span className="text-gray-300 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{Number(tx.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.payment_status === 'paid'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : tx.payment_status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {tx.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {tx.order_status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
