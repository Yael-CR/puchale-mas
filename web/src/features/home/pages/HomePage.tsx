
import { useAuth } from '../../auth/hooks/useAuth'

import Hero from '../../../components/home/Hero'
import AuthCard from '../../../components/auth/AuthCard'

export default function HomePage() {
  const {
    session,
    loading,
    error,
    signInWithGoogle,
    signOut,
  } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-[3px] border-border border-t-brand" />

          <h2 className="mb-1 text-xl font-bold text-text-primary">
            Preparando Puchale+
          </h2>

          <p className="text-[13px] text-text-secondary">
            Comprobando tu sesión...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center bg-[radial-gradient(circle_at_30%_30%,#161a15_0%,var(--background)_70%)] px-4 pt-8 pb-6 sm:px-8 sm:pt-12">
      <div className="grid w-full max-w-[1100px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-[72px]">
        <Hero />

        <AuthCard
          session={session}
          error={error}
          onSignIn={signInWithGoogle}
          onSignOut={signOut}
        />
      </div>

      <footer className="mt-10 flex w-full max-w-[1100px] justify-between gap-3 text-[10px] font-bold tracking-[0.8px] text-text-muted sm:mt-14">
        <span>PUCHALE+ © 2026</span>
        <span>Compra · Ofrece · Gana</span>
      </footer>
    </main>
  )
}
