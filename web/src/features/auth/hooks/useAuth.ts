
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '../../../lib/supabase'

interface AuthState {
  session: Session | null
  loading: boolean
  error: string
}

export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthError: () => void
} {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        console.log('Sesión inicial:', data.session)
        setSession(data.session)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo recuperar la sesión.',
        )
      } finally {
        setLoading(false)
      }
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Evento de autenticación:', event)
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  async function signOut() {
    setError('')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
    }
  }

  function clearAuthError() {
    setError('')
  }

  return {
    session,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearAuthError,
  }
}
