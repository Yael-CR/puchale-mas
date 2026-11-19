
export type ProductStatus = 'draft' | 'published' | 'archived'

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string | null
  condition: string | null
  status: ProductStatus
  created_at: string
  updated_at: string
  images?: ProductImage[]
}

export interface ProductCreate {
  title: string
  description?: string | null
  condition?: string | null
}

export interface ProductUpdate {
  title?: string | null
  description?: string | null
  condition?: string | null
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  position: number
  created_at: string
  url: string
}

export interface ProductImageReorder {
  image_ids: string[]
}

export interface ProductImageReorderResponse {
  success: boolean
  message: string
  images: ProductImage[]
}

export interface ProductImageDeleteResponse {
  id: string
  deleted: boolean
  message: string
}
