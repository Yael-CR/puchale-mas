

import { createProduct } from '../store/productsSlice'
import { useNavigate } from 'react-router-dom'

import { useProducts } from '../hooks/useProducts'
import ProductForm from '../components/ProductForm'

import type { ProductCreate } from '../types/product'

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const { addProduct, saving, error, clearError } = useProducts()

  const handleCreate = async (payload: ProductCreate) => {
    clearError()

    const result = await addProduct(payload)

    if (createProduct.fulfilled.match(result)) {
      navigate(`/productos/${result.payload.id}/editar`)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Crear producto
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Registra los datos principales de tu producto.
          Después podrás administrar sus imágenes.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <ProductForm
          saving={saving}
          onSubmit={handleCreate}
        />
      </div>
    </section>
  )
}
