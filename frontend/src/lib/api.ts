import type { PnlCurve, SelectedTerms, StrikeMatrixItem } from "@/types/pricing";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getStrikeMatrix(): Promise<StrikeMatrixItem[]> {
  return request<StrikeMatrixItem[]>("/strike-matrix");
}

export function getPnlCurve(selection: SelectedTerms): Promise<PnlCurve> {
  const params = new URLSearchParams({
    term: String(selection.term),
    merchantPct: String(selection.merchantPct),
    cycling: selection.cycling.toFixed(1),
    profile: selection.profile,
  });
  return request<PnlCurve>(`/pnl-curve?${params.toString()}`);
}
