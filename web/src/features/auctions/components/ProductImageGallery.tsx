import { useState } from 'react'
import { Package } from 'lucide-react'

import type { ProductImage } from '../types/auction'
import ImageLightbox from './ImageLightbox'

interface ProductImageGalleryProps {
  images: ProductImage[]
  title: string
}

const getImageUrl = (url: string, updatedAt: string) => {
  const version = new Date(updatedAt).getTime()
  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}v=${version}`
}

export default function ProductImageGallery({
  images,
  title,
}: ProductImageGalleryProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const orderedImages = [...images].sort(
    (a, b) => a.position - b.position,
  )

  const selectedImage = orderedImages.find(
    (image) => image.id === selectedImageId,
  )

  const mainImage = selectedImage ?? orderedImages[0]

  if (!mainImage?.url) {
    return (
      <section>
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface text-text-muted sm:rounded-2xl">
          <Package
            className="h-12 w-12 sm:h-16 sm:w-16"
            strokeWidth={1}
          />

          <span className="px-4 text-center text-xs sm:text-sm">
            Este producto todavía no tiene imágenes
          </span>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Imagen principal: 4/3 para evitar franjas vacías con fotos horizontales */}
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ampliar imagen del producto"
          className="group relative block h-full w-full cursor-zoom-in"
        >
          <img
            src={getImageUrl(mainImage.url, mainImage.updated_at)}
            alt={title}
            className="h-full w-full object-contain"
          />

          <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Ampliar imagen
          </span>
        </button>
      </div>

      {/* Miniaturas compactas */}
      {orderedImages.length > 1 && (
        <div className="mt-2.5 grid grid-cols-5 gap-2 sm:mt-3">
          {orderedImages.map((image) => {
            const isSelected = mainImage.id === image.id

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageId(image.id)}
                aria-label={`Ver imagen ${image.position + 1}`}
                aria-pressed={isSelected}
                className={`aspect-square overflow-hidden rounded-md border bg-surface transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand sm:rounded-lg ${
                  isSelected
                    ? 'border-brand ring-2 ring-brand/30'
                    : 'border-border opacity-70 hover:border-brand/50 hover:opacity-100'
                }`}
              >
                {image.url && (
                  <img
                    src={getImageUrl(image.url, image.updated_at)}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Visor ampliado */}
      {lightboxOpen && (
        <ImageLightbox
          images={orderedImages}
          initialImageId={mainImage.id}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onImageChange={setSelectedImageId}
        />
      )}
    </section>
  )
}