import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('id')

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <ScrollReveal>
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-500" />
        <h1 className="font-serif text-4xl text-burgundy-950 md:text-5xl">Order Confirmed!</h1>
        <p className="mt-4 max-w-md text-lg text-burgundy-600">
          Thank you for your order. We'll reach out shortly to confirm your delivery details.
        </p>
        {orderId && (
          <p className="mt-3 text-xs text-burgundy-400">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            className="rounded-full border border-burgundy-200 px-6 py-3 text-sm text-burgundy-700 transition hover:bg-burgundy-50"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="rounded-full bg-burgundy-800 px-6 py-3 text-sm text-white transition hover:bg-burgundy-700"
          >
            Back to Home
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}
