
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'

import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'

import type { ProductImage } from '../types/auction'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5

interface ImageOffset {
  x: number
  y: number
}

type Gesture =
  | {
      type: 'pan'
      startX: number
      startY: number
      originX: number
      originY: number
    }
  | {
      type: 'pinch'
      startDistance: number
      startZoom: number
      startOffset: ImageOffset
      startCenter: ImageOffset
    }
  | {
      type: 'none'
    }

interface ImageLightboxProps {
  images: ProductImage[]
  initialImageId: string
  title: string
  onClose: () => void
  onImageChange: (imageId: string) => void
}

const getImageUrl = (url: string, updatedAt: string) => {
  const version = new Date(updatedAt).getTime()
  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}v=${version}`
}

export default function ImageLightbox({
  images,
  initialImageId,
  title,
  onClose,
  onImageChange,
}: ImageLightboxProps) {
  const [currentImageId, setCurrentImageId] = useState(initialImageId)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState<ImageOffset>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef<Map<number, ImageOffset>>(new Map())
  const gestureRef = useRef<Gesture>({ type: 'none' })

  const viewableImages = images.filter((image) => Boolean(image.url))

  const currentImage =
    viewableImages.find((image) => image.id === currentImageId) ??
    viewableImages[0]

  const currentImageIndex = viewableImages.findIndex(
    (image) => image.id === currentImage?.id,
  )

  // Cerrar el visor con Escape.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const clampOffset = (
    x: number,
    y: number,
    currentZoom: number,
  ): ImageOffset => {
    if (!stageRef.current || currentZoom <= MIN_ZOOM) {
      return { x: 0, y: 0 }
    }

    const rect = stageRef.current.getBoundingClientRect()

    const maxX = (rect.width * (currentZoom - 1)) / 2
    const maxY = (rect.height * (currentZoom - 1)) / 2

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }

  // Acercar o alejar tomando como referencia un punto del visor.
  const zoomAtPoint = (
    newZoom: number,
    pointX = 0,
    pointY = 0,
  ) => {
    const boundedZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, newZoom),
    )

    if (boundedZoom === MIN_ZOOM) {
      setZoom(MIN_ZOOM)
      setOffset({ x: 0, y: 0 })
      return
    }

    const ratio = boundedZoom / zoom

    const newOffset = clampOffset(
      pointX - (pointX - offset.x) * ratio,
      pointY - (pointY - offset.y) * ratio,
      boundedZoom,
    )

    setZoom(boundedZoom)
    setOffset(newOffset)
  }

  const resetZoom = () => {
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
    setIsDragging(false)
    pointersRef.current.clear()
    gestureRef.current = { type: 'none' }
  }

  const selectImage = (imageId: string) => {
    setCurrentImageId(imageId)
    onImageChange(imageId)
    resetZoom()
  }

  const showPreviousImage = () => {
    if (viewableImages.length <= 1) return

    const previousIndex =
      (currentImageIndex - 1 + viewableImages.length) %
      viewableImages.length

    selectImage(viewableImages[previousIndex].id)
  }

  const showNextImage = () => {
    if (viewableImages.length <= 1) return

    const nextIndex = (currentImageIndex + 1) % viewableImages.length

    selectImage(viewableImages[nextIndex].id)
  }

  const zoomIn = () => {
    zoomAtPoint(zoom + ZOOM_STEP)
  }

  const zoomOut = () => {
    zoomAtPoint(zoom - ZOOM_STEP)
  }

  // Zoom mediante la rueda del mouse.
  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    const rect = event.currentTarget.getBoundingClientRect()

    const pointX = event.clientX - rect.left - rect.width / 2
    const pointY = event.clientY - rect.top - rect.height / 2

    const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15

    zoomAtPoint(zoom * factor, pointX, pointY)
  }

  // Inicio de arrastre o gesto de dos dedos.
  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const activePointers = [...pointersRef.current.values()]

    if (activePointers.length >= 2) {
      const [first, second] = activePointers

      const distance = Math.hypot(
        second.x - first.x,
        second.y - first.y,
      )

      const rect = event.currentTarget.getBoundingClientRect()

      gestureRef.current = {
        type: 'pinch',
        startDistance: distance,
        startZoom: zoom,
        startOffset: offset,
        startCenter: {
          x: (first.x + second.x) / 2 - rect.left - rect.width / 2,
          y: (first.y + second.y) / 2 - rect.top - rect.height / 2,
        },
      }

      setIsDragging(false)
      return
    }

    if (zoom > MIN_ZOOM) {
      gestureRef.current = {
        type: 'pan',
        startX: event.clientX,
        startY: event.clientY,
        originX: offset.x,
        originY: offset.y,
      }

      setIsDragging(true)
    }
  }

  // Movimiento del mouse o de los dedos.
  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!pointersRef.current.has(event.pointerId)) return

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const activePointers = [...pointersRef.current.values()]

    // Zoom táctil con dos dedos.
    if (
      activePointers.length >= 2 &&
      gestureRef.current.type === 'pinch'
    ) {
      const [first, second] = activePointers
      const gesture = gestureRef.current

      const distance = Math.hypot(
        second.x - first.x,
        second.y - first.y,
      )

      const rect = event.currentTarget.getBoundingClientRect()

      const center = {
        x: (first.x + second.x) / 2 - rect.left - rect.width / 2,
        y: (first.y + second.y) / 2 - rect.top - rect.height / 2,
      }

      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          gesture.startZoom * (distance / gesture.startDistance),
        ),
      )

      const ratio = newZoom / gesture.startZoom

      const newOffset = clampOffset(
        center.x -
          (gesture.startCenter.x - gesture.startOffset.x) * ratio,
        center.y -
          (gesture.startCenter.y - gesture.startOffset.y) * ratio,
        newZoom,
      )

      setZoom(newZoom)
      setOffset(newOffset)
      return
    }

    // Desplazamiento de imagen ampliada.
    if (
      activePointers.length === 1 &&
      gestureRef.current.type === 'pan'
    ) {
      const gesture = gestureRef.current

      const newOffset = clampOffset(
        gesture.originX + event.clientX - gesture.startX,
        gesture.originY + event.clientY - gesture.startY,
        zoom,
      )

      setOffset(newOffset)
    }
  }

  // Finalización de los gestos.
  const handlePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    pointersRef.current.delete(event.pointerId)

    const remainingPointers = [...pointersRef.current.values()]

    if (remainingPointers.length === 1 && zoom > MIN_ZOOM) {
      const remaining = remainingPointers[0]

      gestureRef.current = {
        type: 'pan',
        startX: remaining.x,
        startY: remaining.y,
        originX: offset.x,
        originY: offset.y,
      }

      setIsDragging(true)
      return
    }

    gestureRef.current = { type: 'none' }
    setIsDragging(false)
  }

  if (!currentImage?.url) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Imagen ampliada de ${title}`}
        className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar imagen ampliada"
          className="absolute right-0 top-0 z-30 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25"
        >
          <X size={24} />
        </button>

        {/* Controles de zoom */}
        <div className="absolute left-1/2 top-0 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 p-2 backdrop-blur">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Alejar imagen"
            className="rounded-full p-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ZoomOut size={21} />
          </button>

          <span className="min-w-14 text-center text-sm font-semibold text-white tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Acercar imagen"
            className="rounded-full p-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ZoomIn size={21} />
          </button>

          <div className="mx-1 h-6 w-px bg-white/20" />

          <button
            type="button"
            onClick={resetZoom}
            aria-label="Restablecer zoom"
            title="Restablecer zoom"
            className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
          >
            <RotateCcw size={19} />
          </button>
        </div>

        {/* Imagen interactiva */}
        <div
          ref={stageRef}
          className={`flex h-full w-full items-center justify-center overflow-hidden touch-none ${
            zoom > MIN_ZOOM
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-zoom-in'
          }`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            src={getImageUrl(
              currentImage.url,
              currentImage.updated_at,
            )}
            alt={title}
            draggable={false}
            className="max-h-[85%] max-w-[85%] select-none object-contain"
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Navegación entre imágenes */}
        {viewableImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Imagen anterior"
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25"
            >
              <ChevronLeft size={30} />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label="Imagen siguiente"
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25"
            >
              <ChevronRight size={30} />
            </button>

            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              {currentImageIndex + 1} / {viewableImages.length}
            </p>
          </>
        )}

        <p className="absolute bottom-0 right-0 hidden text-xs text-white/50 sm:block">
          Rueda del mouse para zoom · Arrastra para desplazarte
        </p>
      </div>
    </div>
  )
}
