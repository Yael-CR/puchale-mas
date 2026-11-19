
export type AuctionType = 'standard' | 'express' | 'exclusive'

export type AuctionStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'closing'
  | 'finished'
  | 'no_winner'
  | 'cancelled'

export interface ProductImage {
  id: string
  storage_path: string
  position: number
  created_at: string
  updated_at: string
  url: string | null
}

export interface AuctionProduct {
  id: string
  title: string
  description: string | null
  condition: string | null
  status: string
  images: ProductImage[]
}

// Respuesta del catálogo público
export interface Auction {
  id: string
  product_id: string
  seller_id: string
  type: string
  status: string
  starting_price: number
  increment_amount: number
  max_bid_amount: number
  currency: string
  current_price: number
  product: AuctionProduct
}

// Datos para crear una subasta
export interface AuctionCreatePayload {
  product_id: string
  type: AuctionType
  starting_price: number
  increment_amount: number
  max_bid_amount: number
  currency: 'MXN'
  starts_at?: string | null
  ends_at?: string | null
  duration_option_id?: string | null
  exclusive_plan_code?: string | null
}

// Datos para actualizar un borrador
export interface AuctionUpdatePayload {
  starting_price?: number
  increment_amount?: number
  max_bid_amount?: number
  starts_at?: string | null
  ends_at?: string | null
  exclusive_plan_code?: string | null
}

// Respuesta de creación, actualización y publicación
export interface AuctionResponse {
  id: string
  product_id: string
  seller_id: string
  type: AuctionType
  status: AuctionStatus
  starts_at: string | null
  ends_at: string | null
  starting_price: number
  increment_amount: number
  max_bid_amount: number
  currency: 'MXN'
  current_price: number
  last_bid_id: string | null
  winner_id: string | null
  duration_option_id: string | null
  duration_seconds_snapshot: number | null
  exclusive_plan_code: string | null
  created_at: string
  published_at: string | null
  closed_at: string | null
  updated_at: string
}
