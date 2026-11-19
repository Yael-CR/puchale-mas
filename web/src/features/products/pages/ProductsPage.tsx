
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, RefreshCw } from 'lucide-react'

import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
  const {
    myProducts,
    loading,
    saving,
    error,
    loadMyProducts,
    publish,
    archive,
    clearError,
  } = useProducts()

  useEffect(() => {
    loadMyProducts()
  }, [loadMyProducts])

  const handlePublish = async (productId: string) => {
    const confirmed = window.confirm(
      '¿Deseas publicar este producto? Una vez publicado estará disponible en el catálogo y podrás crear una subasta.',
    )

    if (!confirmed) return

    await publish(productId)
  }

  const handleArchive = async (productId: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas archivar este producto?',
    )

    if (!confirmed) return

    await archive(productId)
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Mis productos
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Administra tus productos y prepara sus publicaciones.
          </p>
        </div>

        <Link
          to="/productos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-5 py-3 font-semibold text-black transition hover:bg-lime-400"
        >
          <Plus size={18} />
          Nuevo producto
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={clearError}
            className="font-semibold"
          >
            Cerrar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <RefreshCw className="animate-spin text-lime-500" size={28} />
        </div>
      ) : myProducts.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-6 text-center dark:border-zinc-700">
          <Package size={42} className="mb-4 text-zinc-400" />

          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Todavía no tienes productos
          </h2>

          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Crea tu primer producto para comenzar a administrar tu catálogo.
          </p>

          <Link
            to="/productos/nuevo"
            className="mt-5 rounded-xl bg-lime-500 px-5 py-3 font-semibold text-black transition hover:bg-lime-400"
          >
            Crear mi primer producto
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {myProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onArchive={handleArchive}
              onPublish={handlePublish}
              saving={saving}
            />
          ))}
        </div>
      )}
    </section>
  )
}
