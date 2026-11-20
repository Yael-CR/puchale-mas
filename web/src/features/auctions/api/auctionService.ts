
import { api } from '../../../lib/api'

import type {
  Auction,
  AuctionCreatePayload,
  AuctionResponse,
  AuctionUpdatePayload,
  AuctionBid,
  BidRequestCreateResponse,
  BidRequestStatusResponse,
} from '../types/auction'

// Obtener el catálogo público de subastas
export async function getAuctions(): Promise<Auction[]> {
  const response = await api.get<Auction[]>('/auction-catalog')

  return response.data
}

// Obtener una subasta específica con su producto
export async function getAuctionById(
  auctionId: string,
): Promise<Auction> {
  const response = await api.get<Auction>(
    `/auction-catalog/${auctionId}`,
  )

  return response.data
}

// Crear una subasta como borrador
export async function createAuction(
  payload: AuctionCreatePayload,
): Promise<AuctionResponse> {
  const response = await api.post<AuctionResponse>(
    '/auctions',
    payload,
  )

  return response.data
}

// Actualizar la configuración de un borrador
export async function updateAuction(
  auctionId: string,
  payload: AuctionUpdatePayload,
): Promise<AuctionResponse> {
  const response = await api.patch<AuctionResponse>(
    `/auctions/${auctionId}`,
    payload,
  )

  return response.data
}

// Publicar una subasta
export async function publishAuction(
  auctionId: string,
): Promise<AuctionResponse> {
  const response = await api.post<AuctionResponse>(
    `/auctions/${auctionId}/publish`,
  )

  return response.data
}

// ==========================================
// PUJAS
// ==========================================

// Enviar una solicitud de puja
export async function createBidRequest(
  auctionId: string,
  idempotencyKey: string,
): Promise<BidRequestCreateResponse> {
  const response = await api.post<BidRequestCreateResponse>(
    `/auctions/${auctionId}/bids`,
    {
      idempotency_key: idempotencyKey,
    },
  )

  return response.data
}

// Consultar el estado de una solicitud de puja
export async function getBidRequestStatus(
  requestId: string,
): Promise<BidRequestStatusResponse> {
  const response = await api.get<BidRequestStatusResponse>(
    `/auctions/bid-requests/${requestId}`,
  )

  return response.data
}

// Obtener el historial de pujas aceptadas
export async function getAuctionBids(
  auctionId: string,
): Promise<AuctionBid[]> {
  const response = await api.get<AuctionBid[]>(
    `/auctions/${auctionId}/bids`,
  )

  return response.data
}
