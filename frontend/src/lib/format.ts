export function formatAudPerMwYear(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-AU").format(value);
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-AU", { year: "numeric", month: "short", day: "2-digit" }).format(
    new Date(value),
  );
}

export function profileLabel(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
