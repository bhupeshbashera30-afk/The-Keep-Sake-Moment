import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export function AdminLoginPage() {
  const { signIn } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('[AdminLogin] Attempting sign in with:', form.email)

    try {
      const { error } = await signIn(form.email, form.password)
      console.log('[AdminLogin] signIn result error:', error)

      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      console.log('[AdminLogin] Success — navigating to dashboard')
      setLoading(false)
      navigate('/admin/dashboard')
    } catch (err: any) {
      console.error('[AdminLogin] Unexpected error:', err)
      setError(err.message ?? 'Unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-burgundy-50 to-rose-50/60 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-burgundy-950">Admin Access</h1>
          <p className="mt-2 text-sm text-burgundy-500">Keepsake Moments — Staff only</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-burgundy-100 bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm text-burgundy-600">Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                className="w-full rounded-2xl border border-burgundy-200 px-4 py-3 text-burgundy-900 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm text-burgundy-600">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                className="w-full rounded-2xl border border-burgundy-200 px-4 py-3 text-burgundy-900 focus:border-burgundy-400 focus:outline-none focus:ring-2 focus:ring-burgundy-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-burgundy-800 py-3.5 text-sm font-medium text-white transition hover:bg-burgundy-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
