/**
 * Formats a number to Venezuelan Bolívar format: 14.000,00
 * (dot as thousands separator, comma as decimal separator)
 */
export function formatVES(amount: number): string {
  const fixed = Math.abs(amount).toFixed(2);
  const [integer, decimal] = fixed.split('.');
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}${formatted},${decimal}`;
}
