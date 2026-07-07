import type { Profile, SelectedTerms, StrikeMatrixItem } from "@/types/pricing";

export function uniqueSortedNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

export function uniqueSortedProfiles(values: Profile[]): Profile[] {
  return [...new Set(values)].sort();
}

export function sameCell(a: SelectedTerms, b: SelectedTerms): boolean {
  return a.term === b.term && a.merchantPct === b.merchantPct && a.cycling === b.cycling && a.profile === b.profile;
}

function weightedDistance(requested: SelectedTerms, candidate: StrikeMatrixItem): number {
  const termDistance = Math.abs(requested.term - candidate.term) * 1;
  const merchantDistance = Math.abs(requested.merchantPct - candidate.merchantPct) * 0.12;
  const cyclingDistance = Math.abs(requested.cycling - candidate.cycling) * 12;
  const profileDistance = requested.profile === candidate.profile ? 0 : 100;
  return termDistance + merchantDistance + cyclingDistance + profileDistance;
}

export function findNearestPricedCell(
  requested: SelectedTerms,
  matrix: StrikeMatrixItem[],
): StrikeMatrixItem | null {
  if (matrix.length === 0) return null;
  const exact = matrix.find((row) => sameCell(requested, row));
  if (exact) return exact;
  return [...matrix].sort((a, b) => weightedDistance(requested, a) - weightedDistance(requested, b))[0] ?? null;
}
