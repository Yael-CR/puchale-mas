
import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function Navbar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap text-[13px] font-medium transition-colors ${
      isActive
        ? 'text-brand'
        : 'text-text-secondary hover:text-text-primary'
    }`

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface">
      <div className="mx-auto flex min-h-[65px] w-full max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">

        {/* Logo y navegación principal */}
        <div className="flex min-w-0 items-center gap-5 xl:gap-7">

          <Link
            to="/"
            aria-label="Puchale+ inicio"
            className="flex shrink-0 items-center"
          >
            <img
              src="/images/puchale-logo.svg"
              alt="Puchale+"
              className="h-8 w-auto max-w-[112px] object-contain sm:h-9 sm:max-w-[150px]"
            />
          </Link>

          {/* Enlaces: escritorio */}
          <div className="hidden items-center gap-5 lg:flex">
            <NavLink to="/subastas" className={navLinkClass}>
              Subastas
            </NavLink>

            <Link
              to="/subastas"
              className="whitespace-nowrap text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Categorías
            </Link>

            <Link
              to="/subastas"
              className="whitespace-nowrap text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Próximos Lotes
            </Link>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">

          <ThemeToggle />

          <span className="hidden cursor-pointer whitespace-nowrap text-[13px] text-text-secondary transition-colors hover:text-text-primary lg:block">
            Soporte
          </span>

          {/* Buscador */}
          <div className="hidden w-40 rounded-md border border-border bg-surface-secondary px-3.5 py-1.5 text-xs text-text-muted xl:block">
            Buscar lote...
          </div>

          {/* Pujas */}
          <div className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-primary sm:flex">
            <span className="size-[7px] rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
            Pujas 3
          </div>

          {/* Usuario */}
          <div className="hidden size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-surface-secondary text-[11px] font-bold text-text-primary sm:grid">
            ME
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
