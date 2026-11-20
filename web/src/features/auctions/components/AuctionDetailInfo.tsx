import { useState } from 'react'
import { Gavel } from 'lucide-react'

import ProductImageGallery from './ProductImageGallery'

import type { Auction } from '../types/auction'

interface AuctionDetailInfoProps {
  auction: Auction
}

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
  cancelled: 'Cancelada',
}

const auctionTypeLabels: Record<string, string> = {
  standard: 'Subasta estándar',
  express: 'Subasta express',
  exclusive: 'Subasta exclusiva',
}

// Descripciones más largas que esto se muestran colapsadas.
const DESCRIPTION_COLLAPSE_THRESHOLD = 140

export default function AuctionDetailInfo({
  auction,
}: AuctionDetailInfoProps) {
  const [expanded, setExpanded] = useState(false)

  const description = auction.product.description
  const isLongDescription =
    (description?.length ?? 0) > DESCRIPTION_COLLAPSE_THRESHOLD

  return (
    <section className="min-w-0">
      {/* Encabezado: lo primero que se ve, antes que la imagen */}
      <header className="mb-4 sm:mb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand sm:px-3 sm:py-1.5 sm:text-xs">
            {auctionTypeLabels[auction.type] ?? auction.type}
          </span>

          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text-secondary sm:px-3 sm:py-1.5 sm:text-xs">
            {statusLabels[auction.status] ?? auction.status}
          </span>
        </div>

        <h1 className="break-words text-xl font-bold leading-tight text-text-primary sm:text-2xl lg:text-3xl">
          {auction.product.title}
        </h1>

        {auction.product.condition && (
          <p className="mt-1.5 text-xs text-text-secondary sm:text-sm">
            Condición: {auction.product.condition}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-6">
        {/* Galería acotada para que no domine la pantalla */}
        <div className="mx-auto w-full min-w-0 max-w-xs sm:max-w-sm md:max-w-none">
          <ProductImageGallery
            images={auction.product.images ?? []}
            title={auction.product.title}
          />
        </div>

        <div className="min-w-0">
          {/* Resumen de precio compacto */}
          <div className="rounded-xl border border-border bg-surface p-3.5 sm:rounded-2xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-text-secondary sm:text-sm">
                  Precio actual
                </p>

                <p className="mt-1 break-words text-2xl font-bold text-brand sm:text-3xl">
                  {currencyFormatter.format(auction.current_price)}
                </p>
              </div>

              {auction.status === 'active' && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] text-text-secondary sm:text-xs">
                  <Gavel size={13} className="shrink-0" />
                  En curso
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 sm:mt-4 sm:gap-5 sm:pt-4">
              <div className="min-w-0">
                <p className="text-[11px] text-text-secondary sm:text-xs">
                  Precio inicial
                </p>

                <p className="mt-0.5 break-words text-sm font-semibold text-text-primary">
                  {currencyFormatter.format(auction.starting_price)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-text-secondary sm:text-xs">
                  Incremento mínimo
                </p>

                <p className="mt-0.5 break-words text-sm font-semibold text-text-primary">
                  {currencyFormatter.format(auction.increment_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción colapsable */}
          {description && (
            <div className="mt-4 sm:mt-5">
              <h2 className="mb-1.5 text-sm font-bold text-text-primary">
                Descripción
              </h2>

              <p
                className={`whitespace-pre-line text-sm leading-6 text-text-secondary ${
                  isLongDescription && !expanded ? 'line-clamp-3' : ''
                }`}
              >
                {description}
              </p>

              {isLongDescription && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  aria-expanded={expanded}
                  className="mt-1.5 min-h-8 text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {expanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}