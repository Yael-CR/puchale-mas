
import { useEffect, useState, type FormEvent } from 'react'
import { LoaderCircle, Save } from 'lucide-react'

import type {
  Product,
  ProductCreate,
  ProductUpdate,
} from '../types/product'

interface ProductFormProps {
  product?: Product
  saving: boolean
  onSubmit: (payload: ProductCreate) => Promise<unknown>
}

export default function ProductForm({
  product,
  saving,
  onSubmit,
}: ProductFormProps) {
  const [title, setTitle] = useState(product?.title ?? '')
  const [description, setDescription] = useState(
    product?.description ?? '',
  )
  const [condition, setCondition] = useState(
    product?.condition ?? '',
  )

  const isEditing = Boolean(product)

  useEffect(() => {
    setTitle(product?.title ?? '')
    setDescription(product?.description ?? '')
    setCondition(product?.condition ?? '')
  }, [product])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      condition: condition.trim() || null,
    }

    if (!payload.title) return

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="product-title"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nombre del producto *
        </label>

        <input
          id="product-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          placeholder="Ej. Consola de videojuegos"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />

        <p className="mt-1 text-right text-xs text-zinc-500">
          {title.length}/200
        </p>
      </div>

      <div>
        <label
          htmlFor="product-description"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Descripción
        </label>

        <textarea
          id="product-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          placeholder="Describe las características del producto..."
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="product-condition"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Condición del producto
        </label>

        <input
          id="product-condition"
          type="text"
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
          placeholder="Ej. Nuevo, seminuevo, usado..."
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 font-semibold text-black transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {saving
            ? 'Guardando...'
            : isEditing
              ? 'Guardar cambios'
              : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
