
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
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Actividad de la subasta
          </h2>

          <p className="mt-1 text-xs text-text-secondary">
            Conversación de pujas aceptadas en tiempo real.
          </p>

          <div
            className="mt-2 flex items-center gap-2"
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
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:text-brand disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={historyLoading ? 'animate-spin' : ''}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Conversación */}
      <div className="bg-background/40 p-3 sm:p-5">
        {historyError && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500"
          >
            {historyError}
          </p>
        )}

        {historyLoading && bids.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-secondary">
            Cargando conversación...
          </p>
        ) : orderedBids.length === 0 ? (
          <div className="py-12 text-center">
            <Gavel
              size={28}
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
            className="flex max-h-[520px] flex-col gap-4 overflow-y-auto pr-1"
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
                  className={`flex w-full items-start gap-3 ${
                    isOwnBid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar de otros participantes */}
                  {!isOwnBid && (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {bid.bidder_id.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Burbuja */}
                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[75%] ${
                      isOwnBid
                        ? 'rounded-tr-sm border-brand/30 bg-brand/10'
                        : 'rounded-tl-sm border-border bg-surface'
                    } ${
                      isRealtimeBid ? 'bid-realtime-enter' : ''
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs font-semibold text-text-primary">
                        {isOwnBid
                          ? 'Tú'
                          : `Participante ${bid.bidder_id.slice(0, 8)}`}
                      </span>

                      <span className="text-[11px] text-text-secondary">
                        {dateFormatter.format(new Date(bid.accepted_at))}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary">
                      Puja #{bid.sequence_no}
                    </p>

                    <p className="mt-1 text-lg font-bold text-brand">
                      {currencyFormatter.format(bid.amount)}
                    </p>
                  </div>

                  {/* Avatar propio */}
                  {isOwnBid && (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">
                      Tú
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Pie */}
      {orderedBids.length > 0 && (
        <div className="border-t border-border px-4 py-3 sm:px-5">
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
