
import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useProducts } from '../hooks/useProducts'
import ProductForm from '../components/ProductForm'

import { updateProduct } from '../store/productsSlice'

import type { ProductUpdate } from '../types/product'

export default function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const {
    myProducts,
    loading,
    saving,
    error,
    loadMyProducts,
    editProduct,
    clearError,
  } = useProducts()

  const requestedProductId = useRef<string | null>(null)

  const product = myProducts.find(
    (item) => item.id === productId,
  )

  useEffect(() => {
    if (!productId || product) return

    if (requestedProductId.current === productId) return

    requestedProductId.current = productId
    loadMyProducts()
  }, [productId, product, loadMyProducts])

  const handleUpdate = async (payload: ProductUpdate) => {
    if (!productId) return

    clearError()

    const result = await editProduct(productId, payload)

    if (updateProduct.fulfilled.match(result)) {
      navigate('/productos')
    }
  }

  if (loading && !product) {
    return (
      <div className="flex min-h-64 items-center justify-center text-zinc-500">
        Cargando producto...
      </div>
    )
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Producto no encontrado
        </h1>

        <Link
          to="/productos"
          className="mt-5 inline-block text-lime-600 hover:underline"
        >
          Volver a mis productos
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Editar producto
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Actualiza la información de {product.title}.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <ProductForm
          product={product}
          saving={saving}
          onSubmit={handleUpdate}
        />
      </div>
    </section>
  )
}
