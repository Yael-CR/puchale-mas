
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, Gavel } from 'lucide-react'

import { useAuctionDetail } from '../hooks/useAuctionDetail'
import ImageLightbox from '../components/ImageLightbox'

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  active: 'En curso',
  closing: 'Cerrando',
  finished: 'Finalizada',
  no_winner: 'Sin ganador',
}

// Genera una versión dinámica de la URL según la última actualización.
const getImageUrl = (url: string, updatedAt: string) => {
  const version = new Date(updatedAt).getTime()
  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}v=${version}`
}

export default function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>()

  const {
    auction,
    loading,
    error,
  } = useAuctionDetail(auctionId ?? '')

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">
          Cargando detalle de la subasta...
        </p>
      </main>
    )
  }

  if (error || !auction) {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[1000px]">
          <Link
            to="/subastas"
            className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand"
          >
            <ArrowLeft size={17} />
            Volver a subastas
          </Link>

          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h1 className="text-xl font-bold text-text-primary">
              No se pudo cargar la subasta
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              {error ?? 'La subasta solicitada no existe.'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Imágenes ordenadas por posición.
  const images = [...(auction.product.images ?? [])].sort(
    (a, b) => a.position - b.position,
  )

  const selectedImage = images.find(
    (image) => image.id === selectedImageId,
  )

  const mainImage = selectedImage ?? images[0]

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1200px]">

        <Link
          to="/subastas"
          className="mb-7 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-brand"
        >
          <ArrowLeft size={17} />
          Volver a subastas
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

          {/* Galería de imágenes */}
          <section>
            <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface">

              {mainImage?.url ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Ampliar imagen del producto"
                  className="group relative block h-full w-full cursor-zoom-in"
                >
                  <img
                    src={getImageUrl(
                      mainImage.url,
                      mainImage.updated_at,
                    )}
                    alt={auction.product.title}
                    className="h-full w-full object-contain"
                  />

                  <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Ampliar imagen
                  </span>
                </button>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-text-muted">
                  <Package size={72} strokeWidth={1} />

                  <span className="text-sm">
                    Este producto todavía no tiene imágenes
                  </span>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((image) => {
                  const isSelected = mainImage?.id === image.id

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageId(image.id)}
                      aria-label={`Ver imagen ${image.position + 1}`}
                      aria-pressed={isSelected}
                      className={`aspect-square overflow-hidden rounded-lg border bg-surface transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand ${
                        isSelected
                          ? 'border-brand ring-2 ring-brand/30'
                          : 'border-border opacity-70 hover:border-brand/50 hover:opacity-100'
                      }`}
                    >
                      {image.url && (
                        <img
                          src={getImageUrl(
                            image.url,
                            image.updated_at,
                          )}
                          alt={auction.product.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Información de la subasta */}
          <section>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                {auction.type === 'express'
                  ? 'Subasta express'
                  : 'Subasta estándar'}
              </span>

              <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                {statusLabels[auction.status] ?? auction.status}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              {auction.product.title}
            </h1>

            {auction.product.condition && (
              <p className="mt-3 text-sm text-text-secondary">
                Condición: {auction.product.condition}
              </p>
            )}

            {auction.product.description && (
              <div className="mt-6">
                <h2 className="mb-2 text-sm font-bold text-text-primary">
                  Descripción
                </h2>

                <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
                  {auction.product.description}
                </p>
              </div>
            )}

            {/* Información de precios */}
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-text-secondary">
                Precio actual
              </p>

              <p className="mt-2 text-4xl font-bold text-brand">
                {currencyFormatter.format(auction.current_price)}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                  <p className="text-xs text-text-secondary">
                    Precio inicial
                  </p>

                  <p className="mt-1 font-semibold text-text-primary">
                    {currencyFormatter.format(auction.starting_price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary">
                    Incremento mínimo
                  </p>

                  <p className="mt-1 font-semibold text-text-primary">
                    {currencyFormatter.format(auction.increment_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-5 text-sm text-text-secondary">
                <Gavel size={17} />

                <span>
                  {auction.status === 'active'
                    ? 'Esta subasta está en curso.'
                    : `Estado: ${statusLabels[auction.status] ?? auction.status}`}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Visor independiente de imágenes */}
      {lightboxOpen && mainImage?.url && (
        <ImageLightbox
          images={images}
          initialImageId={mainImage.id}
          title={auction.product.title}
          onClose={() => setLightboxOpen(false)}
          onImageChange={setSelectedImageId}
        />
      )}
    </main>
  )
}
