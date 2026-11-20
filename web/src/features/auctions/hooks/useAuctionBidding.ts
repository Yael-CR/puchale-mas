
import { useCallback, useEffect, useRef, useState } from 'react'

import { useAppDispatch } from '../../../app/hooks/useAppDispatch'
import { supabase } from '../../../lib/supabase'

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

export type RealtimeStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

const terminalStatuses: BidRequestStatus[] = [
  'accepted',
  'rejected',
  'expired',
]

const REQUEST_POLLING_INTERVAL = 1500

// Combinar pujas evitando duplicados y ordenando las más recientes primero.
function mergeBids(
  current: AuctionBid[],
  incoming: AuctionBid[],
): AuctionBid[] {
  const bidsById = new Map<string, AuctionBid>()

  current.forEach((bid) => {
    bidsById.set(bid.id, bid)
  })

  incoming.forEach((bid) => {
    bidsById.set(bid.id, bid)
  })

  return Array.from(bidsById.values()).sort(
    (a, b) => b.sequence_no - a.sequence_no,
  )
}

export function useAuctionBidding(auctionId: string) {
  const dispatch = useAppDispatch()

  const [bids, setBids] = useState<AuctionBid[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>('connecting')

  const [lastRealtimeBidId, setLastRealtimeBidId] =
    useState<string | null>(null)




  const [requestId, setRequestId] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] =
    useState<BidRequestStatus | null>(null)

  const [rejectionReason, setRejectionReason] =
    useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  // Control del ciclo de vida del historial.
  const historyRequestInProgress = useRef(false)
  const hasLoadedHistory = useRef(false)
  const activeAuctionId = useRef(auctionId)

  // Reiniciar estados cuando cambia la subasta.
  useEffect(() => {
    activeAuctionId.current = auctionId
    historyRequestInProgress.current = false
    hasLoadedHistory.current = false
    setLastRealtimeBidId(null)

    setBids([])
    setHistoryLoading(false)
    setHistoryError(null)
    setRealtimeStatus('connecting')
    setRequestId(null)
    setRequestStatus(null)
    setRejectionReason(null)
    setRequestError(null)
  }, [auctionId])

  // Consultar historial mediante HTTP.
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

      // Combinar con eventos recibidos mientras se consultaba HTTP.
      setBids((current) => mergeBids(current, result))

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

  // Suscripción a las pujas aceptadas mediante Supabase Realtime.
  useEffect(() => {
    if (!auctionId) {
      setRealtimeStatus('disconnected')
      return
    }

    setRealtimeStatus('connecting')

    const channel = supabase
      .channel(`auction-bids-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          if (activeAuctionId.current !== auctionId) return

          const newBid = payload.new as AuctionBid

          if (
            !newBid.id ||
            newBid.auction_id !== auctionId
          ) {
            return
          }

          setBids((current) => mergeBids(current, [newBid]))
            setLastRealtimeBidId(newBid.id)
            setHistoryError(null)
        },
      )
      .subscribe((status) => {
        if (activeAuctionId.current !== auctionId) return

        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')

          // Sincronizar historial al conectar o reconectar.
          void refreshHistory()
        }

        if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT'
        ) {
          setRealtimeStatus('reconnecting')
          setHistoryError(
            'Se perdió la conexión en tiempo real. Intentando reconectar.',
          )
        }

        if (status === 'CLOSED') {
          setRealtimeStatus('disconnected')
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
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

  // Actualizar precio cuando nuestra puja sea aceptada.
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
    realtimeStatus,
    submitting,
    pending,
    requestStatus,
    requestError,
    rejectionReason,
    submitBid,
    refreshHistory,
    lastRealtimeBidId,
  }
}
