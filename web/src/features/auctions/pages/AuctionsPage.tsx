import { useAuctions } from '../hooks/useAuctions'
import AuctionCard from '../components/AuctionCard'

export default function AuctionsPage() {
  const { auctions, loading, error } = useAuctions()

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-3 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-4xl">
            Subastas
          </h1>

        
        </header>

        {loading && (
          <p className="text-sm text-text-secondary">Cargando subastas...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

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

        {!loading && !error && auctions.length > 0 && (
          <>
            <p className="mb-4 text-sm text-text-secondary sm:mb-5">
              {auctions.length} subastas disponibles
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}