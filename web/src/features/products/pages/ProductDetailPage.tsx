
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'

import { useProducts } from '../hooks/useProducts'

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()

  const {
    items,
    loading,
    error,
    loadProducts,
  } = useProducts()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const product = items.find((item) => item.id === productId)

  const images = [...(product?.images ?? [])].sort(
    (a, b) => a.position - b.position,
  )

  const selectedImage = images[selectedImageIndex] ?? images[0]

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-sm text-text-secondary">
            Cargando producto...
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-sm text-red-500">{error}</p>

          <Link
            to="/catalogo"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand"
          >
            <ArrowLeft size={16} />
            Volver al catálogo
          </Link>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <Package
              size={42}
              className="mx-auto mb-4 text-text-secondary"
            />

            <h1 className="text-xl font-bold text-text-primary">
              Producto no encontrado
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              El producto no existe o ya no está disponible en el catálogo.
            </p>

            <Link
              to="/catalogo"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"
            >
              <ArrowLeft size={16} />
              Volver al catálogo
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1200px]">

        <Link
          to="/catalogo"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-brand"
        >
          <ArrowLeft size={17} />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

          {/* Galería de imágenes */}
          <section>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-secondary">
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-text-secondary">
                  <Package size={56} />
                  <span className="mt-3 text-sm">
                    Sin imágenes disponibles
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                    aria-pressed={selectedImageIndex === index}
                    className={`aspect-square overflow-hidden rounded-lg border bg-surface-secondary transition ${
                      selectedImageIndex === index
                        ? 'border-brand'
                        : 'border-border hover:border-brand'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} - imagen ${index + 1}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Información del producto */}
          <section className="flex flex-col">
            <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-brand">
              PUCHALE+ · CATÁLOGO
            </p>

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {product.condition || 'Sin condición especificada'}
            </p>

            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              {product.title}
            </h1>

            <div className="my-6 border-t border-border" />

            <h2 className="mb-3 text-sm font-bold text-text-primary">
              Descripción
            </h2>

            <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
              {product.description || 'Este producto no cuenta con una descripción.'}
            </p>

            {images.length > 0 && (
              <p className="mt-6 text-xs text-text-secondary">
                {images.length}{' '}
                {images.length === 1 ? 'imagen disponible' : 'imágenes disponibles'}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
