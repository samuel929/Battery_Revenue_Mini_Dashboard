export type Profile = "flat" | "solar";

export type StrikeMatrixItem = {
  term: number;
  merchantPct: number;
  cycling: number;
  profile: Profile;
  pricePerMwYr: number;
};

export type PnlPoint = {
  p: number;
  pnlPerMwYr: number;
};

export type PnlCurve = {
  asOf: string;
  strikePerMwYr: number;
  points: PnlPoint[];
};

export type SelectedTerms = {
  term: number;
  merchantPct: number;
  cycling: number;
  profile: Profile;
};

export type LoadStatus = "idle" | "loading" | "success" | "empty" | "error";
