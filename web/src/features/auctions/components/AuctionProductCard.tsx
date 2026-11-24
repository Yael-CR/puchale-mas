import { Gavel } from 'lucide-react'

import ProductImageGallery from './ProductImageGallery'
import { currencyFormatter } from '../hooks/auctionFormat'

import type { Auction } from '../types/auction'

interface AuctionProductCardProps {
  auction: Auction
}

export default function AuctionProductCard({
  auction,
}: AuctionProductCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
      {/* Galería acotada en móvil; ocupa el ancho de la columna en escritorio */}
      <div className="mx-auto w-full max-w-xs p-3 sm:max-w-sm sm:p-4 lg:max-w-none">
        <ProductImageGallery
          images={auction.product.images ?? []}
          title={auction.product.title}
        />
      </div>

      <div className="border-t border-border p-3.5 sm:p-5">
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
    </div>
  )
}