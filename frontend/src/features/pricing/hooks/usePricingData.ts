import { useEffect, useMemo, useState } from "react";

import { getPnlCurve, getStrikeMatrix } from "@/lib/api";
import { findNearestPricedCell, uniqueSortedNumbers, uniqueSortedProfiles } from "@/lib/grid";
import type { LoadStatus, PnlCurve, Profile, SelectedTerms, StrikeMatrixItem } from "@/types/pricing";

const initialSelection: SelectedTerms = {
  term: 10,
  merchantPct: 20,
  cycling: 1.0,
  profile: "flat",
};

export function usePricingData() {
  const [matrix, setMatrix] = useState<StrikeMatrixItem[]>([]);
  const [selection, setSelection] = useState<SelectedTerms>(initialSelection);
  const [curve, setCurve] = useState<PnlCurve | null>(null);
  const [matrixStatus, setMatrixStatus] = useState<LoadStatus>("loading");
  const [curveStatus, setCurveStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function loadMatrix() {
    setMatrixStatus("loading");
    setError(null);
    try {
      const rows = await getStrikeMatrix();
      setMatrix(rows);
      setMatrixStatus(rows.length > 0 ? "success" : "empty");
      if (rows[0]) {
        setSelection({
          term: rows[0].term,
          merchantPct: rows[0].merchantPct,
          cycling: rows[0].cycling,
          profile: rows[0].profile,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load strike matrix.");
      setMatrixStatus("error");
    }
  }

  useEffect(() => {
    void loadMatrix();
  }, []);

  const options = useMemo(
    () => ({
      terms: uniqueSortedNumbers(matrix.map((row) => row.term)),
      merchantPcts: uniqueSortedNumbers(matrix.map((row) => row.merchantPct)),
      cycling: uniqueSortedNumbers(matrix.map((row) => row.cycling)),
      profiles: uniqueSortedProfiles(matrix.map((row) => row.profile as Profile)),
    }),
    [matrix],
  );

  const pricedCell = useMemo(() => findNearestPricedCell(selection, matrix), [selection, matrix]);

  useEffect(() => {
    if (!pricedCell) return;

    let ignore = false;
    setCurveStatus("loading");
    setCurve(null);
    setError(null);

    getPnlCurve(pricedCell)
      .then((nextCurve) => {
        if (!ignore) {
          setCurve(nextCurve);
          setCurveStatus("success");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Could not load P&L curve.");
          setCurveStatus("error");
        }
      });

    return () => {
      ignore = true;
    };
  }, [pricedCell]);

  return {
    matrix,
    selection,
    setSelection,
    curve,
    matrixStatus,
    curveStatus,
    error,
    options,
    pricedCell,
    reload: loadMatrix,
  };
}
