
import { useEffect } from 'react'

import { useAppDispatch } from '../../../app/hooks/useAppDispatch'
import { useAppSelector } from '../../../app/hooks/useAppSelector'
import { fetchAuctions } from '../store/auctionsSlice'

export function useAuctions() {
  const dispatch = useAppDispatch()

  const { items, loading, error } = useAppSelector(
    (state) => state.auctions,
  )

  useEffect(() => {
    dispatch(fetchAuctions())
  }, [dispatch])

  return {
    auctions: items,
    loading,
    error,
  }
}
