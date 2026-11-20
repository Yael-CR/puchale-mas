import { useCallback, useEffect, useState } from 'react'

import { useAppDispatch } from '../../../app/hooks/useAppDispatch'

import {
  createBidRequest,
  getAuctionBids,
  getBidRequestStatus,
} from '../api/auctionService'


import { refreshAuctionById } from '../store/auctionsSlice'

import type {
  AuctionBid,
  BidRequestStatus,
} from '../types/auction'

const terminalStatuses: BidRequestStatus[] = [
  'accepted',
  'rejected',
  'expired',
]

export function useAuctionBidding(auctionId: string) {
  const dispatch = useAppDispatch()

  const [bids, setBids] = useState<AuctionBid[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [requestId, setRequestId] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] =
    useState<BidRequestStatus | null>(null)

  const [rejectionReason, setRejectionReason] =
    useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  const refreshHistory = useCallback(async () => {
    if (!auctionId) return

    setHistoryLoading(true)
    setHistoryError(null)

    try {
      const result = await getAuctionBids(auctionId)
      setBids(result)
    } catch {
      setHistoryError('No fue posible cargar el historial de pujas.')
    } finally {
      setHistoryLoading(false)
    }
  }, [auctionId])

  // Cargar historial al entrar a la subasta.
  useEffect(() => {
    setBids([])
    setRequestId(null)
    setRequestStatus(null)
    setRejectionReason(null)
    setRequestError(null)

    void refreshHistory()
  }, [auctionId, refreshHistory])

  // Enviar una solicitud de puja.
  const submitBid = useCallback(async () => {
    if (!auctionId || submitting) return

    setSubmitting(true)
    setRequestError(null)
    setRejectionReason(null)
    setRequestStatus(null)
    setRequestId(null)

    try {
      const idempotencyKey = crypto.randomUUID()

      const result = await createBidRequest(
        auctionId,
        idempotencyKey,
      )

      setRequestId(result.id)
      setRequestStatus(result.status)

    } catch {
      setRequestError(
        'No fue posible enviar la solicitud de puja. Inténtalo nuevamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }, [auctionId, submitting])

  // Consultar periódicamente el resultado mientras esté pendiente.
  useEffect(() => {
    if (
      !requestId ||
      !requestStatus ||
      terminalStatuses.includes(requestStatus)
    ) {
      return
    }

    const interval = window.setInterval(async () => {
      try {
        const result = await getBidRequestStatus(requestId)

        setRequestStatus(result.status)
        setRejectionReason(result.rejection_reason)
      } catch {
        setRequestError(
          'No se pudo consultar el resultado. Seguiremos intentando.',
        )
      }
    }, 1500)

    return () => window.clearInterval(interval)
  }, [requestId, requestStatus])

  // Actualizar precio e historial cuando la puja sea aceptada.
 useEffect(() => {
    if (requestStatus !== 'accepted') return

    dispatch(refreshAuctionById(auctionId))
    void refreshHistory()
    }, [requestStatus, auctionId, dispatch, refreshHistory])

  const pending =
    submitting ||
    requestStatus === 'queued' ||
    requestStatus === 'processing'

  return {
    bids,
    historyLoading,
    historyError,
    submitting,
    pending,
    requestStatus,
    requestError,
    rejectionReason,
    submitBid,
    refreshHistory,
  }
}