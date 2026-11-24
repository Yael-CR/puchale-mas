import { auctionTypeLabels, statusLabels } from '../hooks/auctionFormat'

import type { Auction } from '../types/auction'

interface AuctionDetailHeaderProps {
  auction: Auction
}

export default function AuctionDetailHeader({
  auction,
}: AuctionDetailHeaderProps) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand sm:px-3 sm:py-1.5 sm:text-xs">
          {auctionTypeLabels[auction.type] ?? auction.type}
        </span>

        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text-secondary sm:px-3 sm:py-1.5 sm:text-xs">
          {statusLabels[auction.status] ?? auction.status}
        </span>
      </div>

      <h1 className="break-words text-xl font-bold leading-tight text-text-primary sm:text-2xl lg:text-3xl">
        {auction.product.title}
      </h1>
    </div>
  )
}