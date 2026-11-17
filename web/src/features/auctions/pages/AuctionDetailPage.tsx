
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Gavel } from 'lucide-react'

import { useAuctionDetail } from '../hooks/useAuctionDetail'
import ProductImageGallery from '../components/ProductImageGallery'

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  active: 'En curso',
  closing: 'Cerrando',
  finished: 'Finalizada',
  no_winner: 'Sin ganador',
}

export default function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>()

  const {
    auction,
    loading,
    error,
  } = useAuctionDetail(auctionId ?? '')

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">
          Cargando detalle de la subasta...
        </p>
      </main>
    )
  }

  if (error || !auction) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <Link
            to="/subastas"
            className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand"
          >
            <ArrowLeft size={17} />
            Volver a subastas
          </Link>

          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h1 className="text-xl font-bold text-text-primary">
              No se pudo cargar la subasta
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              {error ?? 'La subasta solicitada no existe.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <Link
          to="/subastas"
          className="mb-7 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand"
        >
          <ArrowLeft size={17} />
          Volver a subastas
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Galería de imágenes */}
          <ProductImageGallery
            images={auction.product.images ?? []}
            title={auction.product.title}
          />

          {/* Información de la subasta */}
          <section>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                {auction.type === 'express'
                  ? 'Subasta express'
                  : 'Subasta estándar'}
              </span>

              <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                {statusLabels[auction.status] ?? auction.status}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              {auction.product.title}
            </h1>

            {auction.product.condition && (
              <p className="mt-3 text-sm text-text-secondary">
                Condición: {auction.product.condition}
              </p>
            )}

            {auction.product.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-bold text-text-primary">
                  Descripción
                </h2>

                <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
                  {auction.product.description}
                </p>
              </div>
            )}

            {/* Información de precios */}
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-text-secondary">
                Precio actual
              </p>

              <p className="mt-2 text-4xl font-bold text-brand">
                {currencyFormatter.format(auction.current_price)}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                  <p className="text-xs text-text-secondary">
                    Precio inicial
                  </p>

                  <p className="mt-1 font-semibold text-text-primary">
                    {currencyFormatter.format(auction.starting_price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary">
                    Incremento mínimo
                  </p>

                  <p className="mt-1 font-semibold text-text-primary">
                    {currencyFormatter.format(auction.increment_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-5 text-sm text-text-secondary">
                <Gavel size={17} />

                <span>
                  {auction.status === 'active'
                    ? 'Esta subasta está en curso.'
                    : `Estado: ${statusLabels[auction.status] ?? auction.status}`}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
