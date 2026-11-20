
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useAuctionDetail } from '../hooks/useAuctionDetail'
import { useAuctionBidding } from '../hooks/useAuctionBidding'
import { useAuth } from '../../auth/hooks/useAuth'

import AuctionDetailInfo from '../components/AuctionDetailInfo'
import AuctionParticipation from '../components/AuctionParticipation'

export default function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>()
  const { session } = useAuth()

  const currentUserId = session?.user.id ?? null

  const {
    auction,
    loading,
    error,
  } = useAuctionDetail(auctionId ?? '')

  const {
    bids,
    historyLoading,
    historyError,
    realtimeStatus,
    lastRealtimeBidId,
    pending,
    requestStatus,
    requestError,
    rejectionReason,
    submitBid,
    refreshHistory,
  } = useAuctionBidding(auctionId ?? '')

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background px-4">
        <p className="text-sm text-text-secondary">
          Cargando detalle de la subasta...
        </p>
      </main>
    )
  }

  if (error || !auction) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <Link
            to="/subastas"
            className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand"
          >
            <ArrowLeft size={17} />
            Volver a subastas
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
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
    <main className="min-h-[calc(100vh-65px)] bg-background px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <Link
          to="/subastas"
          className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand sm:mb-7"
        >
          <ArrowLeft size={17} />
          Volver a subastas
        </Link>

        <AuctionDetailInfo auction={auction} />

        <AuctionParticipation
          auctionStatus={auction.status}
          bids={bids}
          historyLoading={historyLoading}
          historyError={historyError}
          realtimeStatus={realtimeStatus}
          lastRealtimeBidId={lastRealtimeBidId}
          currentUserId={currentUserId}
          pending={pending}
          requestStatus={requestStatus}
          requestError={requestError}
          rejectionReason={rejectionReason}
          submitBid={submitBid}
          refreshHistory={refreshHistory}
        />
      </div>
    </main>
  )
}
