
import { useCallback, useEffect, useRef, useState } from 'react'

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

const HISTORY_POLLING_INTERVAL = 2000
const REQUEST_POLLING_INTERVAL = 1500

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

  // Control de solicitudes y ciclo de vida del historial.
  const historyRequestInProgress = useRef(false)
  const hasLoadedHistory = useRef(false)
  const activeAuctionId = useRef(auctionId)

  // Mantener identificada la subasta actual.
  useEffect(() => {
    activeAuctionId.current = auctionId
    historyRequestInProgress.current = false
    hasLoadedHistory.current = false

    setBids([])
    setHistoryLoading(false)
    setHistoryError(null)
    setRequestId(null)
    setRequestStatus(null)
    setRejectionReason(null)
    setRequestError(null)
  }, [auctionId])

  // Consultar historial sin recrear la función por cambios en bids.
  const refreshHistory = useCallback(async () => {
    if (
      !auctionId ||
      activeAuctionId.current !== auctionId ||
      historyRequestInProgress.current
    ) {
      return
    }

    historyRequestInProgress.current = true

    if (!hasLoadedHistory.current) {
      setHistoryLoading(true)
    }

    try {
      const result = await getAuctionBids(auctionId)

      // Ignorar respuestas de una subasta anterior.
      if (activeAuctionId.current !== auctionId) return

      setBids(result)
      setHistoryError(null)
      hasLoadedHistory.current = true
    } catch {
      if (activeAuctionId.current === auctionId) {
        setHistoryError(
          'No fue posible actualizar el historial de pujas.',
        )
      }
    } finally {
      if (activeAuctionId.current === auctionId) {
        historyRequestInProgress.current = false
        setHistoryLoading(false)
      }
    }
  }, [auctionId])

  // Cargar historial al entrar a la subasta.
  useEffect(() => {
    void refreshHistory()
  }, [refreshHistory])

  // Actualizar automáticamente las pujas de todos los participantes.
  useEffect(() => {
    if (!auctionId) return

    const interval = window.setInterval(() => {
      void refreshHistory()
    }, HISTORY_POLLING_INTERVAL)

    return () => window.clearInterval(interval)
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

  // Consultar periódicamente el resultado de la solicitud propia.
  useEffect(() => {
    if (
      !requestId ||
      !requestStatus ||
      terminalStatuses.includes(requestStatus)
    ) {
      return
    }

    const currentRequestId = requestId
    let checking = false

    const interval = window.setInterval(async () => {
      if (checking) return

      checking = true

      try {
        const result = await getBidRequestStatus(currentRequestId)

        setRequestStatus(result.status)
        setRejectionReason(result.rejection_reason)
      } catch {
        setRequestError(
          'No se pudo consultar el resultado. Seguiremos intentando.',
        )
      } finally {
        checking = false
      }
    }, REQUEST_POLLING_INTERVAL)

    return () => window.clearInterval(interval)
  }, [requestId, requestStatus])

  // Actualizar precio e historial cuando nuestra puja sea aceptada.
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
