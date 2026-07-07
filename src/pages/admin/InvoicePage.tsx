import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { FileText, Search, Printer, Download, Loader2, Calendar, Users, Phone, Mail, MapPin } from 'lucide-react'
import { TIME_SLOTS } from '../../lib/siteConfig'

interface BookingRecord {
  id: string
  product_id: string
  order_id: string | null
  booking_date: string
  time_slot: string
  customer_name: string
  email: string | null
  phone: string
  whatsapp: string | null
  num_people: number
  addons: Array<{ id: string; name: string; price: number }>
  addons_total: number
  payment_status: 'pending' | 'paid' | 'failed'
  booking_status?: string
  created_at: string
  products: { name: string; price: number } | null
}

interface OrderRecord {
  id: string
  short_id: string | null
  total: number
  notes: string | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function InvoicePage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [order, setOrder] = useState<OrderRecord | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id,product_id,order_id,booking_date,time_slot,customer_name,email,phone,whatsapp,num_people,addons,addons_total,payment_status,booking_status,created_at,products(name,price)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setBookings((data as unknown as BookingRecord[]) || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBooking = async (b: BookingRecord) => {
    setSelectedBooking(b)
    setOrder(null)
    if (b.order_id && supabase) {
      const { data } = await supabase
        .from('orders')
        .select('id,short_id,total,notes')
        .eq('id', b.order_id)
        .single()
      if (data) setOrder(data as OrderRecord)
    }
  }

  const handlePrint = () => {
    if (!selectedBooking) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const logoUrl = `${window.location.origin}/images/logo-transparent-new.png`
    const slotLabelPrinted = TIME_SLOTS.find(s => s.id === selectedBooking.time_slot)?.label || selectedBooking.time_slot

    // Build parts as normal JS strings to avoid nesting template literal backticks
    const emailLine = selectedBooking.email 
      ? '<div class="invoice-detail-line"><span class="invoice-detail-label">Email:</span> ' + selectedBooking.email + '</div>' 
      : ''
    const whatsappLine = selectedBooking.whatsapp 
      ? '<div class="invoice-detail-line"><span class="invoice-detail-label">WhatsApp:</span> ' + selectedBooking.whatsapp + '</div>' 
      : ''
    const packageLine = selectedBooking.products?.name 
      ? '<div class="invoice-detail-line"><span class="invoice-detail-label">Package:</span> ' + selectedBooking.products.name + '</div>' 
      : ''

    const addonsHtml = (selectedBooking.addons || []).map(addon => 
      '<tr><td>Add-on: ' + addon.name + '</td><td class="right-align">₹' + addon.price.toLocaleString('en-IN') + '</td></tr>'
    ).join('')

    const addonsScheduleLine = addonsTotal > 0 
      ? '<tr><td>Add-ons (full at booking)</td><td>Due at booking</td><td class="right-align">₹' + addonsTotal.toLocaleString('en-IN') + '</td><td><span class="schedule-badge badge-paid">Paid</span></td></tr>' 
      : ''

    const invoiceNum = order?.short_id || selectedBooking.order_id?.slice(0, 8).toUpperCase() || selectedBooking.id.slice(0, 8).toUpperCase()
    const invoiceDate = formatDate(selectedBooking.created_at)
    const eventDate = formatDate(selectedBooking.booking_date)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Keepsake Moments</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: auto; margin: 0mm; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #2d2524; background: #fff; padding: 20mm; font-size: 11px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-card { max-width: 800px; margin: 0 auto; background: #fff; }
          
          /* Header area */
          .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 3px solid #6b1e2f; }
          .logo-container { display: flex; align-items: center; gap: 15px; }
          .invoice-logo-img { height: 60px; width: auto; object-fit: contain; }
          .invoice-logo-text { font-family: Georgia, serif; }
          .invoice-logo-title { font-size: 22px; font-weight: bold; color: #6b1e2f; text-transform: uppercase; letter-spacing: 0.5px; }
          .invoice-logo-sub { font-size: 10px; color: #887877; margin-top: 1px; }
          
          .invoice-meta-block { text-align: right; }
          .invoice-type { font-size: 24px; font-weight: 300; color: #6b1e2f; letter-spacing: 2px; text-transform: uppercase; }
          .invoice-num { font-size: 12px; font-weight: bold; color: #201615; margin-top: 4px; }
          .invoice-date { font-size: 10px; color: #666; margin-top: 2px; }
          
          /* Divided Sections */
          .invoice-section { margin-bottom: 20px; border: 1px solid #f0ebe8; border-radius: 12px; padding: 18px; background: #fdfcfb; }
          .invoice-section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #6b1e2f; border-bottom: 1.5px solid #e5d5d0; padding-bottom: 6px; margin-bottom: 12px; }
          
          /* Info Columns Table */
          .info-table { width: 100%; border-collapse: collapse; }
          .info-cell { width: 50%; vertical-align: top; }
          .info-cell:first-child { padding-right: 15px; border-right: 1px solid #e5d5d0; }
          .info-cell:last-child { padding-left: 15px; }
          
          .invoice-detail-line { font-size: 11px; color: #333; margin-bottom: 6px; }
          .invoice-detail-label { font-weight: 600; color: #6b1e2f; margin-right: 4px; }
          
          /* Data tables */
          .invoice-table { width: 100%; border-collapse: collapse; }
          .invoice-table th { background: #6b1e2f; color: #fff; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; }
          .invoice-table th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
          .invoice-table th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
          .invoice-table td { padding: 10px; border-bottom: 1px solid #e5d5d0; font-size: 11px; color: #333; }
          .invoice-table td.right-align, .invoice-table th.right-align { text-align: right; }
          .invoice-table tr.total-row td { border-top: 2.5px solid #6b1e2f; font-weight: bold; font-size: 13px; color: #6b1e2f; padding-top: 12px; border-bottom: none; }
          
          /* Payment Schedule Table */
          .schedule-table { width: 100%; border-collapse: collapse; }
          .schedule-table th { background: #fdf9f7; color: #6b1e2f; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 8px 10px; border-bottom: 1.5px solid #e5d5d0; text-align: left; }
          .schedule-table td { padding: 9px 10px; border-bottom: 1px solid #f0ebe8; font-size: 10px; color: #444; }
          .schedule-table td.right-align, .schedule-table th.right-align { text-align: right; }
          .schedule-table tr.highlight-row td { background: #fdfaf9; font-weight: bold; color: #6b1e2f; border-top: 1.5px solid #e5d5d0; border-bottom: 1.5px solid #e5d5d0; }
          
          .schedule-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
          .badge-paid { background: #e6f4ea; color: #137333; }
          .badge-pending { background: #fef7e0; color: #b06000; }
          
          /* Signatures */
          .signatures-table { width: 100%; border-collapse: collapse; margin-top: 35px; }
          .signature-field { width: 50%; padding: 0 40px; text-align: center; }
          .signature-line { border-bottom: 1px solid #8c7a78; height: 35px; margin-bottom: 6px; }
          .signature-label { font-size: 8px; text-transform: uppercase; color: #8c7a78; letter-spacing: 1px; }
          
          /* Footer */
          .invoice-footer { margin-top: 35px; text-align: center; border-top: 1.5px dashed #e5d5d0; padding-top: 20px; }
          .thank-you-msg { font-family: Georgia, serif; font-size: 14px; color: #6b1e2f; font-style: italic; font-weight: bold; margin-bottom: 6px; }
           .queries-msg { font-size: 9px; color: #8c7a78; line-height: 1.4; }
          
          @media print { body { padding: 15mm; } }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <!-- Header -->
          <div class="invoice-header">
            <div class="logo-container">
              <img src="${logoUrl}" class="invoice-logo-img" alt="Keepsake Moments Logo" />
              <div class="invoice-logo-text">
                <div class="invoice-logo-title">Keepsake Moments</div>
                <div class="invoice-logo-sub">Premium Event Styling & Decor</div>
              </div>
            </div>
            <div class="invoice-meta-block">
              <div class="invoice-type">INVOICE</div>
              <div class="invoice-num">
                #${invoiceNum}
              </div>
              <div class="invoice-date">
                Date: ${invoiceDate}
              </div>
            </div>
          </div>

          <!-- Customer & Event details Section -->
          <div class="invoice-section">
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="info-cell">
                    <div class="invoice-section-title">Bill To</div>
                    <div class="invoice-detail-line"><span class="invoice-detail-label">Name:</span> ${selectedBooking.customer_name}</div>
                    ${emailLine}
                    <div class="invoice-detail-line"><span class="invoice-detail-label">Phone:</span> ${selectedBooking.phone}</div>
                    ${whatsappLine}
                  </td>
                  <td class="info-cell">
                    <div class="invoice-section-title">Event & Booking Info</div>
                    <div class="invoice-detail-line"><span class="invoice-detail-label">Event Date:</span> ${eventDate}</div>
                    <div class="invoice-detail-line"><span class="invoice-detail-label">Time Slot:</span> ${slotLabelPrinted}</div>
                    <div class="invoice-detail-line"><span class="invoice-detail-label">Total Guests:</span> ${selectedBooking.num_people}</div>
                    ${packageLine}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Line Items Section -->
          <div class="invoice-section">
            <div class="invoice-section-title">Line Items</div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="right-align">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${selectedBooking.products?.name || 'Service Package'}</td>
                  <td class="right-align">₹${productPrice.toLocaleString('en-IN')}</td>
                </tr>
                ${addonsHtml}
                <tr class="total-row">
                  <td>Grand Total</td>
                  <td class="right-align">₹${grandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Payment Schedule Section -->
          <div class="invoice-section">
            <div class="invoice-section-title">Payment Schedule</div>
            <table class="schedule-table">
              <thead>
                <tr>
                  <th>Installment</th>
                  <th>Due Stage</th>
                  <th class="right-align">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Booking Advance (20% of package)</td>
                  <td>Due at booking</td>
                  <td class="right-align">₹${advanceAmount.toLocaleString('en-IN')}</td>
                  <td><span class="schedule-badge badge-paid">Paid</span></td>
                </tr>
                ${addonsScheduleLine}
                <tr class="highlight-row">
                  <td>Total Paid at Booking</td>
                  <td>Advance Payment</td>
                  <td class="right-align">₹${paidNow.toLocaleString('en-IN')}</td>
                  <td><span class="schedule-badge badge-paid">Paid</span></td>
                </tr>
                <tr>
                  <td>Planning Stage (70% of package)</td>
                  <td>Planning phase</td>
                  <td class="right-align">₹${planningDue.toLocaleString('en-IN')}</td>
                  <td><span class="schedule-badge badge-pending">Pending</span></td>
                </tr>
                <tr>
                  <td>After Completion (10% of package)</td>
                  <td>Post-event completion</td>
                  <td class="right-align">₹${completionDue.toLocaleString('en-IN')}</td>
                  <td><span class="schedule-badge badge-pending">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>




          <!-- Footer Section -->
          <div class="invoice-footer">
            <p class="thank-you-msg">Thank you for allowing us to style your special moments!</p>
            <p class="queries-msg">
              This invoice was generated digitally and is valid without physical signatures.<br />
              For queries, contact us at support@keepsake-moments.com or call +91 98765 43210
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const filteredBookings = bookings.filter(b =>
    b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.email || '').toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search) ||
    (b.order_id || '').toLowerCase().includes(search.toLowerCase())
  )

  const productPrice = selectedBooking?.products?.price || 0
  const advanceAmount = Math.ceil(productPrice * 0.20)
  const addonsTotal = selectedBooking?.addons_total || 0
  const paidNow = advanceAmount + addonsTotal
  const planningDue = Math.ceil(productPrice * 0.70)
  const completionDue = productPrice - advanceAmount - planningDue
  const grandTotal = productPrice + addonsTotal

  const slotLabel = selectedBooking
    ? TIME_SLOTS.find(s => s.id === selectedBooking.time_slot)?.label || selectedBooking.time_slot
    : ''

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-burgundy-950 flex items-center gap-2">
          <FileText className="h-7 w-7 text-burgundy-800" />
          Invoice Generator
        </h1>
        <p className="text-xs text-burgundy-400 mt-1">Select a booking to generate and download a professional invoice.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Booking Selector */}
        <div className="rounded-2xl border border-burgundy-100 bg-white p-5 shadow-soft h-fit max-h-[75vh] flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-burgundy-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-205 text-xs outline-none focus:border-burgundy-300 focus:ring-2 focus:ring-burgundy-50"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-2">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : filteredBookings.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-10">No bookings found.</p>
            ) : (
              filteredBookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBooking(b)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedBooking?.id === b.id
                      ? 'border-burgundy-800 bg-burgundy-50/40 shadow-sm'
                      : 'border-gray-100 hover:border-burgundy-200 hover:bg-burgundy-50/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-burgundy-950">{b.customer_name}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{b.products?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatDate(b.booking_date)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="rounded-2xl border border-burgundy-100 bg-white shadow-soft overflow-hidden">
          {!selectedBooking ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <FileText className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm font-medium">Select a booking to preview the invoice</p>
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-burgundy-100 bg-burgundy-50/30">
                <span className="text-xs font-semibold text-burgundy-700">Invoice Preview</span>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-burgundy-800 text-white rounded-lg text-xs font-semibold hover:bg-burgundy-700 transition shadow-glow"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              </div>

              {/* Invoice Content */}
              <div ref={invoiceRef} className="p-8 bg-white print:p-0 print:border-0 print:shadow-none">
                <style dangerouslySetInnerHTML={{__html: `
                  .invoice-preview-card { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #2d2524; line-height: 1.5; }
                  
                  /* Header Area */
                  .invoice-preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 3px solid #6b1e2f; }
                  .logo-container { display: flex; align-items: center; gap: 15px; }
                  .invoice-logo-img { height: 50px; width: auto; object-fit: contain; }
                  .invoice-logo-text { font-family: Georgia, serif; }
                  .invoice-logo-title { font-size: 20px; font-weight: bold; color: #6b1e2f; text-transform: uppercase; letter-spacing: 0.5px; }
                  .invoice-logo-sub { font-size: 10px; color: #887877; margin-top: 1px; }
                  
                  .invoice-meta-block { text-align: right; }
                  .invoice-type { font-size: 22px; font-weight: 300; color: #6b1e2f; letter-spacing: 1.5px; text-transform: uppercase; }
                  .invoice-num { font-size: 11px; font-weight: bold; color: #201615; margin-top: 4px; }
                  .invoice-date { font-size: 9px; color: #666; margin-top: 2px; }
                  
                  /* Divided Sections */
                  .invoice-section { margin-bottom: 18px; border: 1px solid #f0ebe8; border-radius: 12px; padding: 15px; background: #fdfcfb; }
                  .invoice-section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #6b1e2f; border-bottom: 1.5px solid #e5d5d0; padding-bottom: 4px; margin-bottom: 10px; }
                  
                  /* Two column layout */
                  .invoice-details-table { width: 100%; border-collapse: collapse; }
                  .invoice-details-cell { width: 50%; vertical-align: top; }
                  .invoice-details-cell:first-child { padding-right: 15px; border-right: 1px solid #e5d5d0; }
                  .invoice-details-cell:last-child { padding-left: 15px; }
                  
                  .invoice-detail-line { font-size: 11px; color: #333; margin-bottom: 4px; }
                  .invoice-detail-label { font-weight: 600; color: #6b1e2f; margin-right: 4px; }
                  
                  /* Data tables */
                  .invoice-table { width: 100%; border-collapse: collapse; }
                  .invoice-table th { background: #6b1e2f; color: #fff; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; }
                  .invoice-table th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
                  .invoice-table th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
                  .invoice-table td { padding: 9px 10px; border-bottom: 1px solid #e5d5d0; font-size: 11px; color: #333; }
                  .invoice-table td.right-align, .invoice-table th.right-align { text-align: right; }
                  .invoice-table tr.total-row td { border-top: 2.5px solid #6b1e2f; font-weight: bold; font-size: 13px; color: #6b1e2f; padding-top: 10px; border-bottom: none; }
                  
                  /* Payment Schedule Table */
                  .schedule-table { width: 100%; border-collapse: collapse; }
                  .schedule-table th { background: #fdf9f7; color: #6b1e2f; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 8px 10px; border-bottom: 1.5px solid #e5d5d0; text-align: left; }
                  .schedule-table td { padding: 8px 10px; border-bottom: 1px solid #f0ebe8; font-size: 10px; color: #444; }
                  .schedule-table td.right-align, .schedule-table th.right-align { text-align: right; }
                  .schedule-table tr.highlight-row td { background: #fdfaf9; font-weight: bold; color: #6b1e2f; border-top: 1.5px solid #e5d5d0; border-bottom: 1.5px solid #e5d5d0; }
                  
                  .schedule-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
                  .badge-paid { background: #e6f4ea; color: #137333; }
                  .badge-pending { background: #fef7e0; color: #b06000; }
                  
                  /* Signatures */
                  .signatures-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                  .signature-field { width: 50%; padding: 0 40px; text-align: center; }
                  .signature-line { border-bottom: 1px solid #8c7a78; height: 35px; margin-bottom: 6px; }
                  .signature-label { font-size: 8px; text-transform: uppercase; color: #8c7a78; letter-spacing: 1px; }
                  
                  /* Footer */
                  .invoice-footer { margin-top: 30px; text-align: center; border-top: 1.5px dashed #e5d5d0; padding-top: 20px; }
                  .thank-you-msg { font-family: Georgia, serif; font-size: 14px; color: #6b1e2f; font-style: italic; font-weight: bold; margin-bottom: 6px; }
                  .queries-msg { font-size: 9px; color: #8c7a78; line-height: 1.4; }
                `}} />

                <div className="invoice-preview-card">
                  {/* Header */}
                  <div className="invoice-preview-header">
                    <div className="logo-container">
                      <img src="/images/logo-transparent-new.png" className="invoice-logo-img" alt="Keepsake Moments Logo" />
                      <div className="invoice-logo-text">
                        <div className="invoice-logo-title">Keepsake Moments</div>
                        <div className="invoice-logo-sub">Premium Event Styling & Decor</div>
                      </div>
                    </div>
                    <div className="invoice-meta-block">
                      <div className="invoice-type">INVOICE</div>
                      <div className="invoice-num">
                        #{order?.short_id || selectedBooking.order_id?.slice(0, 8).toUpperCase() || selectedBooking.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="invoice-date">
                        Date: {formatDate(selectedBooking.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Customer & Event Details */}
                  <div className="invoice-section">
                    <table className="invoice-details-table">
                      <tbody>
                        <tr>
                          <td className="invoice-details-cell">
                            <div className="invoice-section-title">Bill To</div>
                            <div className="invoice-detail-line"><span className="invoice-detail-label">Name:</span> {selectedBooking.customer_name}</div>
                            {selectedBooking.email && <div className="invoice-detail-line"><span className="invoice-detail-label">Email:</span> {selectedBooking.email}</div>}
                            <div className="invoice-detail-line"><span className="invoice-detail-label">Phone:</span> {selectedBooking.phone}</div>
                            {selectedBooking.whatsapp && <div className="invoice-detail-line"><span className="invoice-detail-label">WhatsApp:</span> {selectedBooking.whatsapp}</div>}
                          </td>
                          <td className="invoice-details-cell">
                            <div className="invoice-section-title">Event & Booking Info</div>
                            <div className="invoice-detail-line"><span className="invoice-detail-label">Event Date:</span> {formatDate(selectedBooking.booking_date)}</div>
                            <div className="invoice-detail-line"><span className="invoice-detail-label">Time Slot:</span> {slotLabel}</div>
                            <div className="invoice-detail-line"><span className="invoice-detail-label">Total Guests:</span> {selectedBooking.num_people}</div>
                            {selectedBooking.products?.name && <div className="invoice-detail-line"><span className="invoice-detail-label">Package:</span> {selectedBooking.products.name}</div>}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Items list */}
                  <div className="invoice-section">
                    <div className="invoice-section-title">Line Items</div>
                    <table className="invoice-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th className="right-align">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{selectedBooking.products?.name || 'Service Package'}</td>
                          <td className="right-align">₹{productPrice.toLocaleString('en-IN')}</td>
                        </tr>
                        {selectedBooking.addons?.map(addon => (
                          <tr key={addon.id}>
                            <td>Add-on: {addon.name}</td>
                            <td className="right-align">₹{addon.price.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td>Grand Total</td>
                          <td className="right-align">₹{grandTotal.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Schedule */}
                  <div className="invoice-section">
                    <div className="invoice-section-title">Payment Schedule</div>
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>Installment</th>
                          <th>Due Stage</th>
                          <th className="right-align">Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Booking Advance (20% of package)</td>
                          <td>Due at booking</td>
                          <td className="right-align">₹{advanceAmount.toLocaleString('en-IN')}</td>
                          <td><span className="schedule-badge badge-paid">Paid</span></td>
                        </tr>
                        {addonsTotal > 0 && (
                          <tr>
                            <td>Add-ons (full at booking)</td>
                            <td>Due at booking</td>
                            <td className="right-align">₹{addonsTotal.toLocaleString('en-IN')}</td>
                            <td><span className="schedule-badge badge-paid">Paid</span></td>
                          </tr>
                        )}
                        <tr className="highlight-row">
                          <td>Total Paid at Booking</td>
                          <td>Advance Payment</td>
                          <td className="right-align">₹{paidNow.toLocaleString('en-IN')}</td>
                          <td><span className="schedule-badge badge-paid">Paid</span></td>
                        </tr>
                        <tr>
                          <td>Planning Stage (70% of package)</td>
                          <td>Planning phase</td>
                          <td className="right-align">₹{planningDue.toLocaleString('en-IN')}</td>
                          <td><span className="schedule-badge badge-pending">Pending</span></td>
                        </tr>
                        <tr>
                          <td>After Completion (10% of package)</td>
                          <td>Post-event completion</td>
                          <td className="right-align">₹{completionDue.toLocaleString('en-IN')}</td>
                          <td><span className="schedule-badge badge-pending">Pending</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>




                  {/* Footer */}
                  <div className="invoice-footer">
                    <p className="thank-you-msg">Thank you for allowing us to style your special moments!</p>
                    <p className="queries-msg">
                      This invoice was generated digitally and is valid without physical signatures.<br />
                      For queries, contact us at support@keepsake-moments.com or call +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
