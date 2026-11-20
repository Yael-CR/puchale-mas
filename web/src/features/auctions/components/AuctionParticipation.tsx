
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
    <div className="mt-8 grid min-w-0 grid-cols-1 items-start gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
      <BidRequestPanel
        auctionStatus={auctionStatus}
        pending={pending}
        requestStatus={requestStatus}
        requestError={requestError}
        rejectionReason={rejectionReason}
        submitBid={submitBid}
      />

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
  )
}
