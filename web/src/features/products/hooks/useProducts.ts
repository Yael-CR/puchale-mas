
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
  fetchProductImages,
  uploadProductImage,
  replaceProductImage,
  deleteProductImage,
  reorderProductImages,
  clearProductsError,
  clearProductImagesError,
  clearProductImages,
} from '../store/productsSlice'

import type {
  ProductCreate,
  ProductUpdate,
  ProductImageReorder,
} from '../types/product'

export function useProducts() {
  const dispatch = useAppDispatch()

  const products = useAppSelector((state) => state.products)

  // PRODUCTOS

  const loadProducts = useCallback(
    () => dispatch(fetchProducts()),
    [dispatch],
  )

  const loadMyProducts = useCallback(
    () => dispatch(fetchMyProducts()),
    [dispatch],
  )

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

  // IMÁGENES

  const loadProductImages = useCallback(
    (productId: string) => dispatch(fetchProductImages(productId)),
    [dispatch],
  )

  const uploadImage = useCallback(
    (productId: string, file: File) =>
      dispatch(uploadProductImage({ productId, file })),
    [dispatch],
  )

  const replaceImage = useCallback(
    (productId: string, imageId: string, file: File) =>
      dispatch(replaceProductImage({ productId, imageId, file })),
    [dispatch],
  )

  const deleteImage = useCallback(
    (productId: string, imageId: string) =>
      dispatch(deleteProductImage({ productId, imageId })),
    [dispatch],
  )

  const reorderImages = useCallback(
    (productId: string, payload: ProductImageReorder) =>
      dispatch(reorderProductImages({ productId, payload })),
    [dispatch],
  )

  const clearImagesError = useCallback(() => {
    dispatch(clearProductImagesError())
  }, [dispatch])

  const resetImages = useCallback(() => {
    dispatch(clearProductImages())
  }, [dispatch])

  return {
    ...products,

    // Productos
    loadProducts,
    loadMyProducts,
    addProduct,
    editProduct,
    publish,
    archive,
    clearError,

    // Imágenes
    loadProductImages,
    uploadImage,
    replaceImage,
    deleteImage,
    reorderImages,
    clearImagesError,
    resetImages,
  }
}
