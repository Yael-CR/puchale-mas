
import { api } from '../../../lib/api'

import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductImage,
  ProductImageReorder,
  ProductImageReorderResponse,
  ProductImageDeleteResponse,
} from '../types/product'

const PRODUCTS_ENDPOINT = '/products'

export const productService = {
  // PRODUCTOS

  async getProducts(): Promise<Product[]> {
    const { data } = await api.get<Product[]>(PRODUCTS_ENDPOINT)
    return data
  },

  async getMyProducts(): Promise<Product[]> {
    const { data } = await api.get<Product[]>(
      `${PRODUCTS_ENDPOINT}/mine`,
    )
    return data
  },

  async createProduct(payload: ProductCreate): Promise<Product> {
    const { data } = await api.post<Product>(
      PRODUCTS_ENDPOINT,
      payload,
    )
    return data
  },

  async updateProduct(
    productId: string,
    payload: ProductUpdate,
  ): Promise<Product> {
    const { data } = await api.patch<Product>(
      `${PRODUCTS_ENDPOINT}/${productId}`,
      payload,
    )
    return data
  },

  async publishProduct(productId: string): Promise<Product> {
    const { data } = await api.patch<Product>(
      `${PRODUCTS_ENDPOINT}/${productId}/publish`,
    )
    return data
  },

  async archiveProduct(productId: string): Promise<Product> {
    const { data } = await api.patch<Product>(
      `${PRODUCTS_ENDPOINT}/${productId}/archive`,
    )
    return data
  },

  // IMÁGENES

  async getProductImages(productId: string): Promise<ProductImage[]> {
    const { data } = await api.get<ProductImage[]>(
      `${PRODUCTS_ENDPOINT}/${productId}/images`,
    )
    return data
  },

  async uploadProductImage(
    productId: string,
    file: File,
  ): Promise<ProductImage> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<ProductImage>(
      `${PRODUCTS_ENDPOINT}/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      },
    )

    return data
  },

  async replaceProductImage(
    productId: string,
    imageId: string,
    file: File,
  ): Promise<ProductImage> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.put<ProductImage>(
      `${PRODUCTS_ENDPOINT}/${productId}/images/${imageId}`,
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      },
    )

    return data
  },

  async deleteProductImage(
    productId: string,
    imageId: string,
  ): Promise<ProductImageDeleteResponse> {
    const { data } = await api.delete<ProductImageDeleteResponse>(
      `${PRODUCTS_ENDPOINT}/${productId}/images/${imageId}`,
    )

    return data
  },

  async reorderProductImages(
    productId: string,
    payload: ProductImageReorder,
  ): Promise<ProductImageReorderResponse> {
    const { data } = await api.put<ProductImageReorderResponse>(
      `${PRODUCTS_ENDPOINT}/${productId}/images/reorder`,
      payload,
    )

    return data
  },
}
