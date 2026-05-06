import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

type AdminAuthContextType = {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  async function checkAdmin(userId: string) {
    if (!supabase) return false
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    console.log('[AdminAuth] checkAdmin result:', data, error)
    return data?.role === 'admin'
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) setIsAdmin(await checkAdmin(session.user.id))
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) setIsAdmin(await checkAdmin(session.user.id))
      else setIsAdmin(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Supabase client not initialized' }

    try {
      console.log('[AdminAuth] Step 1: signing in...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('[AdminAuth] Step 1 result:', authData, authError)

      if (authError) return { error: authError.message }

      console.log('[AdminAuth] Step 2: checking profile for', authData.user.id)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()
      console.log('[AdminAuth] Step 2 result:', profile, profileError)

      if (profileError) return { error: 'Could not verify role: ' + profileError.message }
      if (!profile) return { error: 'No profile found. Contact support.' }
      if (profile.role !== 'admin') {
        await supabase.auth.signOut()
        return { error: 'Access denied. Not an admin account.' }
      }

      console.log('[AdminAuth] Step 3: admin verified, setting session')
      setIsAdmin(true)
      setSession(authData.session)
      return { error: null }

    } catch (err: any) {
      console.error('[AdminAuth] Caught error:', err)
      return { error: err.message ?? 'Unknown error' }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setIsAdmin(false)
    setSession(null)
  }

  return (
    <AdminAuthContext.Provider value={{ session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return ctx
}
