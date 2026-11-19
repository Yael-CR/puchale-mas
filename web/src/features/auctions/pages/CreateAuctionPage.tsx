
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, CheckCircle2, Gavel, LoaderCircle, Save } from 'lucide-react'

import { useProducts } from '../../products/hooks/useProducts'
import {
  createAuction,
  updateAuction,
  publishAuction,
} from '../api/auctionService'

import type {
  AuctionResponse,
  AuctionCreatePayload,
} from '../types/auction'

function getErrorMessage(error: unknown): string {
  const apiError = error as {
    response?: {
      data?: {
        detail?: unknown
      }
    }
  }

  const detail = apiError.response?.data?.detail

  if (typeof detail === 'string') return detail

  if (detail) return JSON.stringify(detail)

  if (error instanceof Error) return error.message

  return 'Ocurrió un error al procesar la subasta.'
}

export default function CreateAuctionPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const {
    myProducts,
    loading: productsLoading,
    loadMyProducts,
  } = useProducts()

  const product = myProducts.find((item) => item.id === productId)

  const [startingPrice, setStartingPrice] = useState('')
  const [incrementAmount, setIncrementAmount] = useState('')
  const [maxBidAmount, setMaxBidAmount] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')

  const [draft, setDraft] = useState<AuctionResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [editing, setEditing] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMyProducts()
  }, [loadMyProducts])

  const handleSaveDraft = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')

    const starting = Number(startingPrice)
    const increment = Number(incrementAmount)
    const maximum = Number(maxBidAmount)

    if (
      !Number.isFinite(starting) ||
      !Number.isFinite(increment) ||
      !Number.isFinite(maximum) ||
      starting < 0 ||
      increment <= 0 ||
      maximum < starting
    ) {
      setError('Revisa los precios. El incremento debe ser mayor a cero y el máximo no puede ser menor al precio inicial.')
      return
    }

    const startDate = new Date(startsAt)
    const endDate = new Date(endsAt)

    if (
      !startsAt ||
      !endsAt ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      setError('La fecha de cierre debe ser posterior a la fecha de inicio.')
      return
    }

    if (!productId) {
      setError('No se encontró el identificador del producto.')
      return
    }

    const payload: AuctionCreatePayload = {
      product_id: productId,
      type: 'standard',
      starting_price: starting,
      increment_amount: increment,
      max_bid_amount: maximum,
      currency: 'MXN',
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
    }

    setSaving(true)

    try {
      if (draft) {
        const updated = await updateAuction(draft.id, {
          starting_price: starting,
          increment_amount: increment,
          max_bid_amount: maximum,
          starts_at: payload.starts_at,
          ends_at: payload.ends_at,
        })

        setDraft(updated)
      } else {
        const created = await createAuction(payload)
        setDraft(created)
      }

      setEditing(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!draft) return

    setError('')
    setPublishing(true)

    try {
      const published = await publishAuction(draft.id)
      setDraft(published)
      navigate('/subastas')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPublishing(false)
    }
  }

  if (productsLoading && !product) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle size={30} className="animate-spin text-lime-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Producto no encontrado
        </h1>

        <p className="mt-2 text-zinc-500">
          No encontramos el producto seleccionado en tus productos.
        </p>

        <Link
          to="/productos"
          className="mt-5 inline-flex items-center gap-2 text-lime-600"
        >
          <ArrowLeft size={17} />
          Volver a mis productos
        </Link>
      </section>
    )
  }

  if (product.status !== 'published') {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Producto no publicado
        </h1>

        <p className="mt-2 text-zinc-500">
          Debes publicar el producto antes de crear una subasta.
        </p>

        <Link
          to={`/productos/${product.id}/editar`}
          className="mt-5 inline-flex items-center gap-2 text-lime-600"
        >
          <ArrowLeft size={17} />
          Volver al producto
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/productos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-lime-600"
      >
        <ArrowLeft size={17} />
        Mis productos
      </Link>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-lime-500/15 p-3 text-lime-600">
            <Gavel size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Crear subasta
            </h1>
            <p className="text-sm text-zinc-500">
              Configura una subasta estándar para tu producto.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Producto seleccionado
          </p>

          <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
            {product.title}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {product.description || 'Sin descripción'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {draft && !editing ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-amber-600">
              <Save size={19} />
              <span className="font-semibold">Borrador guardado</span>
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Revisa la configuración antes de publicar tu subasta.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Precio inicial</p>
                <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                  ${Number(draft.starting_price).toLocaleString('es-MX')} MXN
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Incremento por puja</p>
                <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                  ${Number(draft.increment_amount).toLocaleString('es-MX')} MXN
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Precio máximo</p>
                <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                  ${Number(draft.max_bid_amount).toLocaleString('es-MX')} MXN
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Tipo de subasta</p>
                <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                  Estándar
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Inicio</p>
                <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                  {draft.starts_at
                    ? new Date(draft.starts_at).toLocaleString('es-MX')
                    : 'Sin fecha'}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Cierre</p>
                <p className="mt-1 text-sm text-zinc-900 dark:text-white">
                  {draft.ends_at
                    ? new Date(draft.ends_at).toLocaleString('es-MX')
                    : 'Sin fecha'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Editar configuración
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-lime-400 disabled:opacity-50"
              >
                {publishing ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {publishing ? 'Publicando...' : 'Publicar subasta'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSaveDraft}
          className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Configuración de precios
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Todos los importes se expresan en pesos mexicanos.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Precio inicial (MXN)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={startingPrice}
                onChange={(event) => setStartingPrice(event.target.value)}
                placeholder="Ej. 500"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Incremento por puja (MXN)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={incrementAmount}
                onChange={(event) => setIncrementAmount(event.target.value)}
                placeholder="Ej. 50"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Precio máximo permitido (MXN)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={maxBidAmount}
                onChange={(event) => setMaxBidAmount(event.target.value)}
                placeholder="Ej. 5000"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <div className="mb-5 flex items-center gap-2">
              <CalendarClock size={19} className="text-lime-600" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Programación
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Fecha y hora de inicio
                </label>

                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Fecha y hora de cierre
                </label>

                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            {draft && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                Cancelar edición
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 font-semibold text-black transition hover:bg-lime-400 disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? 'Guardando...'
                : draft
                  ? 'Guardar cambios'
                  : 'Guardar como borrador'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
