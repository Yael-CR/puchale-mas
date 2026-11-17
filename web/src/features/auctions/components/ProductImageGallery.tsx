
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
        <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface text-text-muted">
          <Package size={72} strokeWidth={1} />

          <span className="text-sm">
            Este producto todavía no tiene imágenes
          </span>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Imagen principal */}
      <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
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

          <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Ampliar imagen
          </span>
        </button>
      </div>

      {/* Miniaturas */}
      {orderedImages.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {orderedImages.map((image) => {
            const isSelected = mainImage.id === image.id

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
