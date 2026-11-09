import { useAuth } from './features/auth/hooks/useAuth'
import { AuthDiagnostics } from './features/dev-tools/components/AuthDiagnostics'
import './App.css'

function Navbar() {
  return (
    <nav className="top-navbar">
      <div className="nav-left">
        <div className="brand-logo-small">V</div>
        <span className="nav-brand">
          PUCHALE<span>+</span>
        </span>
        <div className="nav-links">
          <a href="#subastas">Subastas</a>
          <a href="#categorias">Categorías</a>
          <a href="#proximos">Próximos Lotes</a>
        </div>
      </div>
      <div className="nav-right">
        <span className="nav-support">Soporte</span>
        <div className="nav-search-placeholder">Buscar lote...</div>
        <div className="nav-bids-pill">
          <span className="bids-dot" />
          <span>Pujas 3</span>
        </div>
        <div className="nav-user-badge">ME</div>
      </div>
    </nav>
  )
}

function App() {
  const { session, loading, error, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="app-shell">
          <div className="loading-card">
            <div className="loading-spinner" />
            <h2>Preparando Puchale+</h2>
            <p>Comprobando tu sesión...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="app-shell">
        <div className="hero">
          <div className="hero-copy">
            <span className="eyebrow">SUBASTAS EN TIEMPO REAL</span>

            <h1>
              Cada oferta
              <br />
              <span>cuenta.</span>
            </h1>

            <p className="description">
              Descubre productos exclusivos, participa en subastas en vivo y
              encuentra tu próxima gran oportunidad.
            </p>
          </div>

          <section className="auth-card">
            <div className="card-decoration" />

            <div className="card-content">
              {session ? (
                <div className="authenticated-section">
                  <div className="success-icon">✓</div>

                  <h2>¡Has iniciado sesión!</h2>

                  <p className="session-description">
                    Tu cuenta está conectada correctamente al sistema.
                  </p>

                  <div className="user-info">
                    <div>
                      <span>Correo electrónico</span>
                      <strong>{session.user.email}</strong>
                    </div>

                    <div>
                      <span>Identificador de usuario</span>
                      <strong className="uid">{session.user.id}</strong>
                    </div>
                  </div>

                  {import.meta.env.DEV && (
                    <div className="diagnostics">
                      <AuthDiagnostics session={session} />
                    </div>
                  )}

                  <button className="button-secondary" onClick={signOut}>
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="login-section">
                  <h2 className="card-title">Entra a Puchale+</h2>

                  <button className="google-button" onClick={signInWithGoogle}>
                    <span className="google-icon">G</span>
                    Continuar con Google
                    <span className="button-arrow">→</span>
                  </button>

                  <p className="login-note">
                    Accede de forma segura con tu cuenta verificada de Google.
                  </p>
                </div>
              )}

              {error && (
                <div className="error-message" role="alert">
                  <strong>Error de autenticación</strong>
                  <p>{error}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="app-footer">
          <span>PUCHALE+ © 2026</span>
          <span>Compra · Ofrece · Gana</span>
        </footer>
      </main>
    </>
  )
}

export default App