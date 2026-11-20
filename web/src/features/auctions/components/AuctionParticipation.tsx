import BidRequestPanel from './BidRequestPanel'
import AuctionBidHistory from './AuctionBidHistory'

import type {
  AuctionBid,
  BidRequestStatus,
} from '../types/auction'

import type { RealtimeStatus } from '../hooks/useAuctionBidding'

interface AuctionParticipationProps {
  auctionStatus: string
  bids: AuctionBid[]
  historyLoading: boolean
  historyError: string | null
  realtimeStatus: RealtimeStatus
  lastRealtimeBidId: string | null
  currentUserId: string | null
  pending: boolean
  requestStatus: BidRequestStatus | null
  requestError: string | null
  rejectionReason: string | null
  submitBid: () => void | Promise<void>
  refreshHistory: () => void | Promise<void>
}

export default function AuctionParticipation({
  auctionStatus,
  bids,
  historyLoading,
  historyError,
  realtimeStatus,
  lastRealtimeBidId,
  currentUserId,
  pending,
  requestStatus,
  requestError,
  rejectionReason,
  submitBid,
  refreshHistory,
}: AuctionParticipationProps) {
  return (
    // Una sola columna: vive dentro del panel lateral de la página.
    // En escritorio ocupa como máximo la altura visible; el panel de puja
    // siempre queda a la vista y solo el historial se desplaza.
    <div className="flex min-w-0 flex-col gap-4 lg:max-h-[calc(100vh-6.5rem)]">
      <div className="shrink-0">
        <BidRequestPanel
          auctionStatus={auctionStatus}
          pending={pending}
          requestStatus={requestStatus}
          requestError={requestError}
          rejectionReason={rejectionReason}
          submitBid={submitBid}
        />
      </div>

      <div className="flex min-h-0 flex-col lg:flex-auto">
        <AuctionBidHistory
          bids={bids}
          historyLoading={historyLoading}
          historyError={historyError}
          realtimeStatus={realtimeStatus}
          lastRealtimeBidId={lastRealtimeBidId}
          currentUserId={currentUserId}
          refreshHistory={refreshHistory}
        />
      </div>
    </div>
  )
}