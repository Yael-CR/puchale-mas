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

  const statusLabel = statusLabels[auction.status] ?? auction.status

  return (
    <Link
      to={`/subastas/${auction.id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand sm:rounded-2xl"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-background sm:aspect-[4/3]">
        {mainImage?.url ? (
          <img
            src={getImageUrl(mainImage.url, mainImage.updated_at)}
            alt={auction.product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted sm:gap-3">
            <Package
              className="h-8 w-8 sm:h-12 sm:w-12"
              strokeWidth={1.2}
            />
            <span className="text-[10px] sm:text-xs">Imagen próximamente</span>
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-bold uppercase text-text-primary backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[11px]">
          {auction.type === 'express' ? 'Express' : 'Estándar'}
        </span>

        <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-semibold text-text-primary backdrop-blur sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[11px]">
          {statusLabel}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="mb-2 sm:mb-3">
          <h2 className="line-clamp-1 text-sm font-bold text-text-primary sm:text-lg">
            {auction.product.title}
          </h2>

          {auction.product.condition && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-text-secondary sm:mt-1 sm:text-xs">
              Condición: {auction.product.condition}
            </p>
          )}
        </div>

        {/* La descripción solo aparece desde tablet para mantener la card compacta en móvil */}
        {auction.product.description && (
          <p className="mb-4 hidden min-h-10 line-clamp-2 text-sm text-text-secondary sm:block">
            {auction.product.description}
          </p>
        )}

        <div className="mt-auto rounded-lg bg-background p-2.5 sm:rounded-xl sm:p-4">
          <p className="text-[11px] text-text-secondary sm:text-xs">
            Precio actual
          </p>

          <p className="mt-0.5 truncate text-lg font-bold text-brand sm:mt-1 sm:text-2xl">
            {currencyFormatter.format(auction.current_price)}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 sm:mt-3 sm:pt-3">
            <span className="text-[10px] text-text-secondary sm:text-xs">
              <span className="sm:hidden">Incremento</span>
              <span className="hidden sm:inline">Incremento mínimo</span>
            </span>

            <span className="text-xs font-semibold text-text-primary sm:text-sm">
              {currencyFormatter.format(auction.increment_amount)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-secondary sm:gap-2 sm:text-xs">
            <Gavel className="h-3 w-3 shrink-0 sm:h-[15px] sm:w-[15px]" />
            <span className="truncate">
              {auction.status === 'active' ? 'Subasta activa' : statusLabel}
            </span>
          </span>

          <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:inline">
            PUCHALE+
          </span>
        </div>
      </div>
    </Link>
  )
}