import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Gavel, RefreshCw } from 'lucide-react'

import { useAuctionDetail } from '../hooks/useAuctionDetail'
import { useAuctionBidding } from '../hooks/useAuctionBidding'

import ProductImageGallery from '../components/ProductImageGallery'

import type { BidRequestStatus } from '../types/auction'

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

export default function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>()

  const {
    auction,
    loading,
    error,
  } = useAuctionDetail(auctionId ?? '')

  const {
    bids,
    historyLoading,
    historyError,
    pending,
    requestStatus,
    requestError,
    rejectionReason,
    submitBid,
    refreshHistory,
  } = useAuctionBidding(auctionId ?? '')

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
          <ProductImageGallery
            images={auction.product.images ?? []}
            title={auction.product.title}
          />

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

            {/* Precios */}
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

            {/* Participar en la subasta */}
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-bold text-text-primary">
                Participar en la subasta
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Envía tu solicitud de puja. El servidor verificará las
                condiciones de la subasta y procesará tu participación.
              </p>

              <button
                type="button"
                onClick={() => void submitBid()}
                disabled={auction.status !== 'active' || pending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Gavel size={18} />

                {pending
                  ? 'Procesando solicitud...'
                  : 'Enviar puja'}
              </button>

              {auction.status !== 'active' && (
                <p className="mt-3 text-center text-xs text-text-secondary">
                  No puedes pujar porque esta subasta no está activa.
                </p>
              )}

              {requestStatus && (
                <div className="mt-5 rounded-xl border border-border p-4">
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
                      Tu puja fue registrada correctamente. El precio y
                      el historial se actualizarán.
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
                <p className="mt-3 text-sm text-red-500">
                  {requestError}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Historial */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Historial de pujas
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Pujas aceptadas en esta subasta.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void refreshHistory()}
              disabled={historyLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:text-brand disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={historyLoading ? 'animate-spin' : ''}
              />
              Actualizar
            </button>
          </div>

          {historyError && (
            <p className="mb-4 text-sm text-red-500">
              {historyError}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {historyLoading && bids.length === 0 ? (
              <p className="p-6 text-center text-sm text-text-secondary">
                Cargando historial...
              </p>
            ) : bids.length === 0 ? (
              <p className="p-8 text-center text-sm text-text-secondary">
                Todavía no hay pujas aceptadas.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {[...bids].reverse().map((bid) => (
                  <div
                    key={bid.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">
                        Puja #{bid.sequence_no}
                      </p>

                      <p className="mt-1 text-xs text-text-secondary">
                        {new Date(bid.accepted_at).toLocaleString('es-MX')}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-brand">
                      {currencyFormatter.format(bid.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}