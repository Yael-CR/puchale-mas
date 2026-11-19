
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

import { useProducts } from '../hooks/useProducts'

export default function ProductCatalogPage() {
  const {
    items,
    loading,
    error,
    loadProducts,
  } = useProducts()

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1200px]">

        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-brand">
            PUCHALE+
          </p>

          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Catálogo
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Descubre productos disponibles y encuentra tu próximo artículo.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-text-secondary">
            Cargando productos...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <Package
              size={42}
              className="mx-auto mb-4 text-text-secondary"
            />

            <h2 className="font-semibold text-text-primary">
              No hay productos disponibles
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Vuelve pronto para descubrir nuevos productos.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                {items.length} productos disponibles
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => {
                const mainImage = [...(product.images ?? [])]
                  .sort((a, b) => a.position - b.position)[0]

                return (
                  <Link
                    key={product.id}
                    to={`/catalogo/${product.id}`}
                    className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-brand"
                  >
                    <article>
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
                        {mainImage ? (
                          <img
                            src={mainImage.url}
                            alt={product.title}
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center text-text-secondary">
                            <Package size={42} />
                            <span className="mt-2 text-xs">
                              Sin imagen disponible
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                          {product.condition || 'Sin condición especificada'}
                        </p>

                        <h2 className="line-clamp-2 text-lg font-bold text-text-primary">
                          {product.title}
                        </h2>

                        <p className="mt-2 line-clamp-3 min-h-[60px] text-sm text-text-secondary">
                          {product.description || 'Sin descripción disponible.'}
                        </p>

                        {product.images && product.images.length > 1 && (
                          <p className="mt-4 text-xs text-text-secondary">
                            {product.images.length} imágenes disponibles
                          </p>
                        )}

                        <p className="mt-4 text-sm font-semibold text-brand">
                          Ver producto →
                        </p>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
