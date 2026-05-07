import { X } from 'lucide-react'
import { InquiryForm } from './InquiryForm'

interface InquiryModalProps {
  open: boolean
  onClose: () => void
  defaultService?: string
  defaultNotes?: string
  submissionType?: 'contact' | 'booking'
  timestamp?: number
}

export function InquiryModal({ open, onClose, defaultService, defaultNotes, submissionType = 'booking', timestamp }: InquiryModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#f7f1ee] p-6 shadow-2xl md:p-8 animate-fade-up" style={{ animationDuration: '0.3s' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-burgundy-200 bg-white p-2 text-burgundy-500 transition hover:bg-burgundy-50 hover:text-burgundy-800"
          aria-label="Close enquiry form"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-10">
          <p className="text-xs uppercase tracking-[0.35em] text-burgundy-500">Enquiry</p>
          <h2 className="mt-2 font-serif text-3xl text-burgundy-950">Tell us what you're planning.</h2>
          <p className="mt-2 text-sm leading-relaxed text-burgundy-600">
            Share the basics and the team will shape the next steps personally.
          </p>
        </div>

        {/* Form */}
        <InquiryForm key={timestamp || 'modal-form'} compact initialService={defaultService} initialNotes={defaultNotes} submissionType={submissionType} />
      </div>
    </div>
  )
}
