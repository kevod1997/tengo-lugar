export function formatCurrency(amount: number, currency: string = 'ARS', locale: string = 'es-AR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}
