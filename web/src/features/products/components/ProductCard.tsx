
import { Link } from 'react-router-dom'
import {
  Pencil,
  Archive,
  ExternalLink,
  Gavel,
  Send,
} from 'lucide-react'

import type { Product } from '../types/product'
import ProductStatusBadge from './ProductStatusBadge'

interface ProductCardProps {
  product: Product
  onArchive: (productId: string) => void
  onPublish: (productId: string) => void
  saving: boolean
}

export default function ProductCard({
  product,
  onArchive,
  onPublish,
  saving,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {product.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {product.description || 'Sin descripción'}
          </p>
        </div>

        <ProductStatusBadge status={product.status} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500">
          Actualizado:{' '}
          {new Date(product.updated_at).toLocaleDateString('es-MX')}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/productos/${product.id}/editar`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Pencil size={15} />
            Editar
          </Link>

          {product.status === 'draft' && (
            <button
              type="button"
              onClick={() => onPublish(product.id)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-lime-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} />
              Publicar producto
            </button>
          )}

          {product.status === 'published' && (
            <>
              <Link
                to={`/productos/${product.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-lime-500 px-3 py-2 text-sm font-medium text-black transition hover:bg-lime-400"
              >
                <ExternalLink size={15} />
                Ver
              </Link>

              <Link
                to={`/subastas/nueva/${product.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-lime-500 px-3 py-2 text-sm font-medium text-lime-700 transition hover:bg-lime-50 dark:text-lime-400 dark:hover:bg-lime-950"
              >
                <Gavel size={15} />
                Crear subasta
              </Link>
            </>
          )}

          {product.status !== 'archived' && (
            <button
              type="button"
              onClick={() => onArchive(product.id)}
              disabled={saving}
              title="Archivar producto"
              className="rounded-lg border border-zinc-300 p-2 text-zinc-500 transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              <Archive size={17} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
