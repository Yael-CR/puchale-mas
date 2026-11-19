
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, RefreshCw, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { useAppDispatch } from '../../../app/hooks/useAppDispatch'
import { useAppSelector } from '../../../app/hooks/useAppSelector'
import {
  fetchProductImages,
  uploadProductImage,
  replaceProductImage,
  deleteProductImage,
  reorderProductImages,
  clearProductImages,
  clearProductImagesError,
} from '../store/productsSlice'

interface ProductImageManagerProps {
  productId: string
}

const MAX_IMAGE_SIZE = 8 * 1024 * 1024

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export default function ProductImageManager({
  productId,
}: ProductImageManagerProps) {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const {
    images,
    imagesLoading,
    imagesSaving,
    imagesError,
  } = useAppSelector((state) => state.products)

  const [replacingImageId, setReplacingImageId] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(clearProductImages())
    dispatch(fetchProductImages(productId))

    return () => {
      dispatch(clearProductImages())
    }
  }, [dispatch, productId])

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato no permitido. Utiliza JPG, PNG o WEBP.'
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return 'La imagen supera el límite de 8 MB.'
    }

    if (file.size === 0) {
      return 'El archivo está vacío.'
    }

    return null
  }

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? [])

    setLocalError(null)
    dispatch(clearProductImagesError())

    if (!files.length) return

    for (const file of files) {
      const validationError = validateFile(file)

      if (validationError) {
        setLocalError(`${file.name}: ${validationError}`)
        break
      }

      try {
        await dispatch(
          uploadProductImage({ productId, file }),
        ).unwrap()
      } catch {
        break
      }
    }

    await dispatch(fetchProductImages(productId))
    event.target.value = ''
  }

  const openReplaceDialog = (imageId: string) => {
    setReplacingImageId(imageId)
    replaceInputRef.current?.click()
  }

  const handleReplace = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file || !replacingImageId) return

    setLocalError(null)
    dispatch(clearProductImagesError())

    const validationError = validateFile(file)

    if (validationError) {
      setLocalError(validationError)
      event.target.value = ''
      setReplacingImageId(null)
      return
    }

    try {
      await dispatch(
        replaceProductImage({
          productId,
          imageId: replacingImageId,
          file,
        }),
      ).unwrap()

      await dispatch(fetchProductImages(productId))
    } catch {
      // El error se conserva en el estado de Redux.
    }

    event.target.value = ''
    setReplacingImageId(null)
  }

  const handleDelete = async (imageId: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar esta imagen?',
    )

    if (!confirmed) return

    setLocalError(null)
    dispatch(clearProductImagesError())

    try {
      await dispatch(
        deleteProductImage({ productId, imageId }),
      ).unwrap()
    } catch {
      // El error se muestra desde Redux.
    }
  }

  const handleMove = async (
    imageId: string,
    direction: 'up' | 'down',
  ) => {
    const currentIndex = images.findIndex(
      (image) => image.id === imageId,
    )

    if (currentIndex < 0) return

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= images.length) return

    const reorderedImages = [...images]

    const [movedImage] = reorderedImages.splice(currentIndex, 1)
    reorderedImages.splice(targetIndex, 0, movedImage)

    try {
      await dispatch(
        reorderProductImages({
          productId,
          payload: {
            image_ids: reorderedImages.map((image) => image.id),
          },
        }),
      ).unwrap()
    } catch {
      // El error se muestra desde Redux.
    }
  }

  return (
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Galería de imágenes
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Administra las fotografías de este producto. La primera imagen
          será la imagen principal.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imagesSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {imagesSaving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ImagePlus size={17} />
          )}
          Agregar imágenes
        </button>

        <span className="text-xs text-gray-500 dark:text-neutral-400">
          JPG, PNG o WEBP. Máximo 8 MB por imagen.
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleReplace}
      />

      {localError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {localError}
        </div>
      )}

      {imagesError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {imagesError}
        </div>
      )}

      {imagesLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-neutral-400">
          <LoaderCircle size={20} className="animate-spin" />
          Cargando imágenes...
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center dark:border-neutral-700">
          <ImagePlus
            size={30}
            className="mx-auto text-gray-400 dark:text-neutral-500"
          />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-neutral-300">
            Este producto todavía no tiene imágenes.
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            Agrega fotografías para completar su presentación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700"
            >
              <div className="relative aspect-square bg-gray-100 dark:bg-neutral-800">
                <img
                  src={image.url}
                  alt={`Imagen ${index + 1} del producto`}
                  className="h-full w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-lime-600 px-2 py-1 text-xs font-medium text-white">
                    <Star size={12} fill="currentColor" />
                    Principal
                  </span>
                )}
              </div>

              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
                  Imagen {index + 1}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Mover hacia arriba"
                      aria-label="Mover imagen hacia arriba"
                      disabled={imagesSaving || index === 0}
                      onClick={() => handleMove(image.id, 'up')}
                      className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <ArrowUp size={15} />
                    </button>

                    <button
                      type="button"
                      title="Mover hacia abajo"
                      aria-label="Mover imagen hacia abajo"
                      disabled={
                        imagesSaving || index === images.length - 1
                      }
                      onClick={() => handleMove(image.id, 'down')}
                      className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Reemplazar imagen"
                      aria-label="Reemplazar imagen"
                      disabled={imagesSaving}
                      onClick={() => openReplaceDialog(image.id)}
                      className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <RefreshCw size={15} />
                    </button>

                    <button
                      type="button"
                      title="Eliminar imagen"
                      aria-label="Eliminar imagen"
                      disabled={imagesSaving}
                      onClick={() => handleDelete(image.id)}
                      className="rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30 dark:border-red-900 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
