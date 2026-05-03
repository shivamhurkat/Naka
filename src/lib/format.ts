// Indian number and date formatting helpers.
// These do NOT change with locale — Indian conventions apply throughout.

const IN = new Intl.NumberFormat("en-IN");
const IN_CURRENCY = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "125.50 qtl" */
export function formatQty(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${IN.format(n)} qtl`;
}

/** "₹ 1,25,000" */
export function formatMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  return `₹ ${IN_CURRENCY.format(n)}`;
}

/** "03/05/2026" */
export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "03/05/2026, 14:30" */
export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "2.5%" */
export function formatPct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n}%`;
}
