
import type { ProductStatus } from '../types/product'

interface ProductStatusBadgeProps {
  status: ProductStatus
}

const statusConfig: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Borrador',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  published: {
    label: 'Publicado',
    className: 'bg-lime-500/10 text-lime-600 border-lime-500/20',
  },
  archived: {
    label: 'Archivado',
    className: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  },
}

export default function ProductStatusBadge({
  status,
}: ProductStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
