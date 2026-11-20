import { Gavel, RefreshCw } from 'lucide-react'

import type { AuctionBid } from '../types/auction'
import type { RealtimeStatus } from '../hooks/useAuctionBidding'

interface AuctionBidHistoryProps {
  bids: AuctionBid[]
  historyLoading: boolean
  historyError: string | null
  realtimeStatus: RealtimeStatus
  lastRealtimeBidId: string | null
  currentUserId: string | null
  refreshHistory: () => void | Promise<void>
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: 'short',
})

const connectionStatus = {
  connecting: {
    label: 'Conectando...',
    dot: 'bg-gray-400 animate-pulse',
    text: 'text-text-secondary',
  },
  connected: {
    label: 'En vivo',
    dot: 'bg-green-500',
    text: 'text-green-500',
  },
  reconnecting: {
    label: 'Reconectando...',
    dot: 'bg-yellow-500 animate-pulse',
    text: 'text-yellow-500',
  },
  disconnected: {
    label: 'Desconectado',
    dot: 'bg-red-500',
    text: 'text-red-500',
  },
}

export default function AuctionBidHistory({
  bids,
  historyLoading,
  historyError,
  realtimeStatus,
  lastRealtimeBidId,
  currentUserId,
  refreshHistory,
}: AuctionBidHistoryProps) {
  const orderedBids = [...bids].sort(
    (a, b) => b.sequence_no - a.sequence_no,
  )

  const connection = connectionStatus[realtimeStatus]

  return (
    <section className="flex min-h-0 flex-auto flex-col overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
      {/* Encabezado fijo */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-text-primary">
            Actividad de la subasta
          </h2>

          <div
            className="mt-1 flex items-center gap-2"
            role="status"
            aria-live="polite"
          >
            <span className={`size-2 rounded-full ${connection.dot}`} />

            <span className={`text-xs font-medium ${connection.text}`}>
              {connection.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refreshHistory()}
          disabled={historyLoading}
          aria-label="Actualizar historial"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:text-brand disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={historyLoading ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {/* Conversación: única zona con scroll */}
      <div className="max-h-80 min-h-0 flex-auto overflow-y-auto overscroll-contain bg-background/40 p-3 [scrollbar-color:rgb(255_255_255/0.18)_transparent] [scrollbar-width:thin] lg:max-h-none">
        {historyError && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500"
          >
            {historyError}
          </p>
        )}

        {historyLoading && bids.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            Cargando conversación...
          </p>
        ) : orderedBids.length === 0 ? (
          <div className="py-8 text-center">
            <Gavel
              size={26}
              className="mx-auto mb-3 text-text-secondary opacity-60"
            />

            <p className="text-sm font-medium text-text-primary">
              Todavía no hay pujas
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              ¡Sé el primero en participar en esta subasta!
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col gap-3"
            aria-live="polite"
            aria-relevant="additions"
          >
            {orderedBids.map((bid) => {
              const isOwnBid =
                currentUserId !== null &&
                bid.bidder_id === currentUserId

              const isRealtimeBid = bid.id === lastRealtimeBidId

              return (
                <article
                  key={bid.id}
                  className={`flex w-full items-start gap-2 ${
                    isOwnBid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar de otros participantes */}
                  {!isOwnBid && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                      {bid.bidder_id.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Burbuja */}
                  <div
                    className={`min-w-0 max-w-[85%] rounded-xl border px-3 py-2 shadow-sm ${
                      isOwnBid
                        ? 'rounded-tr-sm border-brand/30 bg-brand/10'
                        : 'rounded-tl-sm border-border bg-surface'
                    } ${
                      isRealtimeBid ? 'bid-realtime-enter' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-semibold text-text-primary">
                        {isOwnBid
                          ? 'Tú'
                          : `Participante ${bid.bidder_id.slice(0, 8)}`}
                      </span>

                      <span className="shrink-0 text-[11px] text-text-secondary">
                        {dateFormatter.format(new Date(bid.accepted_at))}
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <p className="text-base font-bold text-brand">
                        {currencyFormatter.format(bid.amount)}
                      </p>

                      <p className="shrink-0 text-[11px] text-text-secondary">
                        Puja #{bid.sequence_no}
                      </p>
                    </div>
                  </div>

                  {/* Avatar propio */}
                  {isOwnBid && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-black">
                      Tú
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Pie fijo */}
      {orderedBids.length > 0 && (
        <div className="shrink-0 border-t border-border px-4 py-2">
          <p className="text-center text-xs text-text-secondary">
            {orderedBids.length}{' '}
            {orderedBids.length === 1
              ? 'puja aceptada'
              : 'pujas aceptadas'}
          </p>
        </div>
      )}
    </section>
  )
}