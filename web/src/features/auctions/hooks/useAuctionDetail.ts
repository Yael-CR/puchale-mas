

import { useEffect } from 'react'

import { useAppDispatch } from '../../../app/hooks/useAppDispatch'
import { useAppSelector } from '../../../app/hooks/useAppSelector'
import {
  fetchAuctionById,
  clearAuctionDetail,
} from '../store/auctionsSlice'

export function useAuctionDetail(auctionId: string) {
  const dispatch = useAppDispatch()

  const { selectedAuction, detailLoading, error } = useAppSelector(
    (state) => state.auctions,
  )

  useEffect(() => {
    if (!auctionId) return

    dispatch(fetchAuctionById(auctionId))

    return () => {
      dispatch(clearAuctionDetail())
    }
  }, [dispatch, auctionId])

  return {
    auction: selectedAuction,
    loading: detailLoading,
    error,
  }
}
