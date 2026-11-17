
import { api } from '../../../lib/api'
import type { Auction } from '../types/auction'

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
