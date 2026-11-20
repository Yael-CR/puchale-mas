
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

export default function AuctionDetailInfo({
  auction,
}: AuctionDetailInfoProps) {
  return (
    <section className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
      <div className="min-w-0">
        <ProductImageGallery
          images={auction.product.images ?? []}
          title={auction.product.title}
        />
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand">
            {auctionTypeLabels[auction.type] ?? auction.type}
          </span>

          <span className="rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary">
            {statusLabels[auction.status] ?? auction.status}
          </span>
        </div>

        <h1 className="break-words text-2xl font-bold leading-tight text-text-primary sm:text-3xl lg:text-4xl">
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

        <div className="mt-7 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <p className="text-sm text-text-secondary">
            Precio actual
          </p>

          <p className="mt-2 break-words text-3xl font-bold text-brand sm:text-4xl">
            {currencyFormatter.format(auction.current_price)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:gap-5 sm:pt-5">
            <div className="min-w-0">
              <p className="text-xs text-text-secondary">
                Precio inicial
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-text-primary sm:text-base">
                {currencyFormatter.format(auction.starting_price)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs text-text-secondary">
                Incremento mínimo
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-text-primary sm:text-base">
                {currencyFormatter.format(auction.increment_amount)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-sm text-text-secondary">
            <Gavel size={17} className="mt-0.5 shrink-0" />

            <span>
              {auction.status === 'active'
                ? 'Esta subasta está en curso.'
                : `Estado: ${statusLabels[auction.status] ?? auction.status}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
