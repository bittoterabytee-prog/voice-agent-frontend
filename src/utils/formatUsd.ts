/** Format USD estimates for POC cost display (not live wallet balance). */
export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "$0.0000";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(amount);
}
