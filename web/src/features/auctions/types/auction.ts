
export interface AuctionProduct {
  id: string
  title: string
  description: string | null
  condition: string | null
  status: string
}

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
