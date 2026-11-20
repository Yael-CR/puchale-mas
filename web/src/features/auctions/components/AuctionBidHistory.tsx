
import { Gavel, RefreshCw } from 'lucide-react'

import type { AuctionBid } from '../types/auction'

interface AuctionBidHistoryProps {
  bids: AuctionBid[]
  historyLoading: boolean
  historyError: string | null
  refreshHistory: () => void | Promise<void>
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

export default function AuctionBidHistory({
  bids,
  historyLoading,
  historyError,
  refreshHistory,
}: AuctionBidHistoryProps) {
  const orderedBids = [...bids].sort(
    (a, b) => b.sequence_no - a.sequence_no,
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Historial de pujas
          </h2>

          <p className="mt-1 text-xs text-text-secondary">
            Pujas aceptadas en esta subasta.
          </p>
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

      <div>
        {historyError && (
          <p role="alert" className="px-4 pt-4 text-sm text-red-500 sm:px-5">
            {historyError}
          </p>
        )}

        {historyLoading && bids.length === 0 ? (
          <p className="p-6 text-center text-sm text-text-secondary">
            Cargando historial...
          </p>
        ) : bids.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Gavel
              size={25}
              className="mx-auto mb-3 text-text-secondary opacity-60"
            />

            <p className="text-sm font-medium text-text-primary">
              Todavía no hay pujas aceptadas
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              Cuando se acepte una puja aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orderedBids.map((bid) => (
              <div
                key={bid.id}
                className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    Puja #{bid.sequence_no}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {new Date(bid.accepted_at).toLocaleString('es-MX')}
                  </p>
                </div>

                <p className="shrink-0 text-base font-bold text-brand sm:text-lg">
                  {currencyFormatter.format(bid.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
