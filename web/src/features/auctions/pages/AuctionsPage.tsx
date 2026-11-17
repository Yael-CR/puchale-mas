
import { useAuctions } from '../hooks/useAuctions'

export default function AuctionsPage() {
  const { auctions, loading, error } = useAuctions()

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-brand">
            PUCHALE+
          </p>

          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Subastas
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Descubre productos y participa en las subastas disponibles.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-text-secondary">
            Cargando subastas...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && auctions.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h2 className="font-semibold text-text-primary">
              No hay subastas disponibles
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Vuelve pronto para descubrir nuevos lotes.
            </p>
          </div>
        )}

        {!loading && auctions.length > 0 && (
          <p className="text-sm text-text-secondary">
            {auctions.length} subastas disponibles
          </p>
        )}
      </div>
    </main>
  )
}
