
import type { Session } from '@supabase/supabase-js'
import { AuthDiagnostics } from '../../features/dev-tools/components/AuthDiagnostics'

interface AuthCardProps {
  session: Session | null
  error: string | null
  onSignIn: () => void
  onSignOut: () => void
}

function AuthCard({
  session,
  error,
  onSignIn,
  onSignOut,
}: AuthCardProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
      <div className="h-[3px] bg-gradient-to-r from-border to-brand" />

      <div className="p-6 sm:p-8">
        {session ? (
          <div className="text-center">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full border border-brand/30 bg-brand/10 text-[22px] font-bold text-brand">
              ✓
            </div>

            <h2 className="mb-1 text-xl font-bold tracking-tight text-text-primary">
              ¡Has iniciado sesión!
            </h2>

            <p className="text-[13px] text-text-secondary">
              Tu cuenta está conectada correctamente al sistema.
            </p>

            <div className="my-6 grid gap-2.5 text-left">
              <div className="grid gap-1 rounded-[10px] border border-border bg-background p-3">
                <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">
                  Correo electrónico
                </span>
                <strong className="break-all text-[13px] font-semibold text-text-primary">
                  {session.user.email}
                </strong>
              </div>

              <div className="grid gap-1 rounded-[10px] border border-border bg-background p-3">
                <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase">
                  Identificador de usuario
                </span>
                <strong className="break-all text-[13px] font-semibold text-text-primary">
                  {session.user.id}
                </strong>
              </div>
            </div>

            {import.meta.env.DEV && (
              <div className="my-5 rounded-[10px] border border-border bg-background p-3.5 text-left text-text-primary">
                <AuthDiagnostics session={session} />
              </div>
            )}

            <button
              type="button"
              onClick={onSignOut}
              className="w-full rounded-[10px] border border-border bg-transparent p-3.5 font-semibold text-text-secondary transition-colors hover:border-text-muted hover:bg-surface-secondary hover:text-text-primary"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div>
            <h2 className="mb-5 text-lg font-bold tracking-tight text-text-primary">
              Entra a Puchale+
            </h2>

            <button
              type="button"
              onClick={onSignIn}
              className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 text-sm font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-surface-secondary hover:shadow-[0_6px_20px_rgba(163,255,0,0.15)]"
            >
              <span className="text-lg font-bold text-brand">G</span>
              Continuar con Google
              <span className="ml-auto text-lg text-brand">→</span>
            </button>

            <p className="mt-4 text-center text-xs text-text-muted">
              Accede de forma segura con tu cuenta verificada de Google.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-[13px] text-danger"
          >
            <strong>Error de autenticación</strong>
            <p className="my-1">{error}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default AuthCard
