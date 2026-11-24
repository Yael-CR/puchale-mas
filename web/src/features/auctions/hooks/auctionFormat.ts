export const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

export const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  active: 'En curso',
  closing: 'Cerrando',
  finished: 'Finalizada',
  no_winner: 'Sin ganador',
  cancelled: 'Cancelada',
}

export const auctionTypeLabels: Record<string, string> = {
  standard: 'Subasta estándar',
  express: 'Subasta express',
  exclusive: 'Subasta exclusiva',
}