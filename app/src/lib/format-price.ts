// Client components import this file, so it must not import server modules such as @/lib/db.

/** Format price amount to locale-formatted display string. */
export function formatPrice(amount: number, locale: string = "en-US"): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
