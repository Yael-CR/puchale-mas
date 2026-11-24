import { useId, useState } from 'react'

import type { Auction } from '../types/auction'

interface AuctionProductDetailsProps {
  auction: Auction
}

// En móvil/tablet, descripciones más largas que esto se muestran colapsadas.
// En escritorio (lg+) siempre se muestran completas.
const DESCRIPTION_COLLAPSE_THRESHOLD = 140

export default function AuctionProductDetails({
  auction,
}: AuctionProductDetailsProps) {
  const [expanded, setExpanded] = useState(false)
  const descriptionId = useId()

  const { description, condition } = auction.product
  const isLongDescription =
    (description?.length ?? 0) > DESCRIPTION_COLLAPSE_THRESHOLD

  if (!description && !condition) return null

  return (
    <section
      aria-labelledby={`${descriptionId}-title`}
      className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:rounded-2xl sm:p-6"
    >Participar en la subasta
      <h2
        id={`${descriptionId}-title`}
        className="mb-3 text-base font-bold text-text-primary sm:mb-4 sm:text-lg"
      >
        Detalles del producto
      </h2>

      <dl className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-x-8">
        {condition && (
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Condición
            </dt>

            <dd className="mt-1 break-words text-sm font-medium text-text-primary">
              {condition}
            </dd>
          </div>
        )}

        {description && (
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Descripción
            </dt>

            <dd className="mt-1 min-w-0">
              <p
                id={descriptionId}
                className={`whitespace-pre-line break-words text-sm leading-6 text-text-secondary lg:max-w-4xl lg:line-clamp-none ${
                  isLongDescription && !expanded ? 'line-clamp-3' : ''
                }`}
              >
                {description}
              </p>

              {isLongDescription && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  aria-expanded={expanded}
                  aria-controls={descriptionId}
                  className="mt-1.5 min-h-8 text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-brand lg:hidden"
                >
                  {expanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}