
import { Link } from 'react-router-dom'
import { Package, Gavel } from 'lucide-react'
import type { Auction } from '../types/auction'

interface AuctionCardProps {
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
}

// Genera una versión dinámica de la URL según la última actualización.
const getImageUrl = (url: string, updatedAt: string) => {
  const version = new Date(updatedAt).getTime()
  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}v=${version}`
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const mainImage = auction.product.images
    ?.slice()
    .sort((a, b) => a.position - b.position)[0]

  return (
    <Link
      to={`/subastas/${auction.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        {mainImage?.url ? (
          <img
            src={getImageUrl(
              mainImage.url,
              mainImage.updated_at
            )}
            alt={auction.product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-text-muted">
            <Package size={48} strokeWidth={1.2} />
            <span className="text-xs">Imagen próximamente</span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase text-text-primary backdrop-blur">
          {auction.type === 'express' ? 'Express' : 'Estándar'}
        </span>

        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-text-primary backdrop-blur">
          {statusLabels[auction.status] ?? auction.status}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h2 className="line-clamp-1 text-lg font-bold text-text-primary">
            {auction.product.title}
          </h2>

          {auction.product.condition && (
            <p className="mt-1 text-xs text-text-secondary">
              Condición: {auction.product.condition}
            </p>
          )}
        </div>

        {auction.product.description && (
          <p className="mb-4 line-clamp-2 min-h-10 text-sm text-text-secondary">
            {auction.product.description}
          </p>
        )}

        <div className="rounded-xl bg-background p-4">
          <p className="text-xs text-text-secondary">Precio actual</p>

          <p className="mt-1 text-2xl font-bold text-brand">
            {currencyFormatter.format(auction.current_price)}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-text-secondary">
              Incremento mínimo
            </span>

            <span className="text-sm font-semibold text-text-primary">
              {currencyFormatter.format(auction.increment_amount)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-text-secondary">
            <Gavel size={15} />
            {auction.status === 'active'
              ? 'Subasta activa'
              : statusLabels[auction.status] ?? auction.status}
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            PUCHALE+
          </span>
        </div>
      </div>
    </Link>
  )
}
