
import { Gavel } from 'lucide-react'

import type { BidRequestStatus } from '../types/auction'

interface BidRequestPanelProps {
  auctionStatus: string
  pending: boolean
  requestStatus: BidRequestStatus | null
  requestError: string | null
  rejectionReason: string | null
  submitBid: () => void | Promise<void>
}

const bidStatusLabels: Record<BidRequestStatus, string> = {
  queued: 'Solicitud en espera',
  processing: 'Procesando puja',
  accepted: '¡Puja aceptada!',
  rejected: 'Puja rechazada',
  expired: 'Solicitud expirada',
}

const rejectionLabels: Record<string, string> = {
  auction_ended: 'La subasta ya terminó.',
  auction_not_active: 'La subasta no está activa.',
  seller_cannot_bid: 'No puedes pujar en tu propia subasta.',
}

export default function BidRequestPanel({
  auctionStatus,
  pending,
  requestStatus,
  requestError,
  rejectionReason,
  submitBid,
}: BidRequestPanelProps) {
  const canBid = auctionStatus === 'active'

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Gavel size={20} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Participar en la subastas
          </h2>

          <p className="mt-0.5 text-xs text-text-secondary">
            Envía tu solicitud de puja
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-text-secondary">
        El servidor verificará las condiciones de la subasta y procesará
        tu participación. Tu puja solo se registrará cuando sea aceptada.
      </p>

      <button
        type="button"
        onClick={() => void submitBid()}
        disabled={!canBid || pending}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-black transition-all hover:brightness-95 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Gavel size={18} />
        {pending ? 'Procesando solicitud...' : 'Enviar puja'}
      </button>

      {!canBid && (
        <p className="mt-3 text-center text-xs text-text-secondary">
          No puedes pujar porque esta subasta no está activa.
        </p>
      )}

      {requestStatus && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 rounded-xl border border-border bg-background/50 p-4"
        >
          <p className="font-semibold text-text-primary">
            {bidStatusLabels[requestStatus]}
          </p>

          {requestStatus === 'queued' && (
            <p className="mt-1 text-sm text-text-secondary">
              Tu solicitud está esperando ser procesada.
            </p>
          )}

          {requestStatus === 'processing' && (
            <p className="mt-1 text-sm text-text-secondary">
              Estamos verificando tu puja.
            </p>
          )}

          {requestStatus === 'accepted' && (
            <p className="mt-1 text-sm text-text-secondary">
              Tu puja fue registrada correctamente. El precio y el
              historial se actualizarán.
            </p>
          )}

          {requestStatus === 'rejected' && (
            <p className="mt-1 text-sm text-text-secondary">
              {rejectionReason
                ? rejectionLabels[rejectionReason] ?? rejectionReason
                : 'La solicitud no cumplió las condiciones de la subasta.'}
            </p>
          )}

          {requestStatus === 'expired' && (
            <p className="mt-1 text-sm text-text-secondary">
              La solicitud expiró y no fue procesada.
            </p>
          )}
        </div>
      )}

      {requestError && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {requestError}
        </p>
      )}
    </section>
  )
}
