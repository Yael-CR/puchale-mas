import { useCallback } from 'react'

import { useAppSelector } from '../../../app/hooks/useAppSelector'
import { useAppDispatch } from '../../../app/hooks/useAppDispatch'



import {
  fetchMyProducts,
  fetchProducts,
  createProduct,
  updateProduct,
  publishProduct,
  archiveProduct,
  clearProductsError,
} from '../store/productsSlice'

import type {
  ProductCreate,
  ProductUpdate,
} from '../types/product'

export function useProducts() {
  const dispatch = useAppDispatch()

  const products = useAppSelector((state) => state.products)

  const loadProducts = useCallback(() => {
    return dispatch(fetchProducts())
  }, [dispatch])

  const loadMyProducts = useCallback(() => {
    return dispatch(fetchMyProducts())
  }, [dispatch])

  const addProduct = useCallback(
    (payload: ProductCreate) => dispatch(createProduct(payload)),
    [dispatch],
  )

  const editProduct = useCallback(
    (productId: string, payload: ProductUpdate) =>
      dispatch(updateProduct({ productId, payload })),
    [dispatch],
  )

  const publish = useCallback(
    (productId: string) => dispatch(publishProduct(productId)),
    [dispatch],
  )

  const archive = useCallback(
    (productId: string) => dispatch(archiveProduct(productId)),
    [dispatch],
  )

  const clearError = useCallback(() => {
    dispatch(clearProductsError())
  }, [dispatch])

  return {
    ...products,
    loadProducts,
    loadMyProducts,
    addProduct,
    editProduct,
    publish,
    archive,
    clearError,
  }
}