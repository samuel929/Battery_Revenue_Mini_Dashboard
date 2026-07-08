import { type PointerEvent, useRef } from "react";
import { GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAudPerMwYear, profileLabel } from "@/lib/format";
import type { StrikeMatrixItem } from "@/types/pricing";

type Props = {
  rows: StrikeMatrixItem[];
};

export function PricingTable({ rows }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    dragState.current = { active: true, startX: event.clientX, scrollLeft: element.scrollLeft };
    element.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element || !dragState.current.active) return;
    const delta = event.clientX - dragState.current.startX;
    element.scrollLeft = dragState.current.scrollLeft - delta;
  }

  function stopDrag() {
    dragState.current.active = false;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
      <Card id="pricing-grid">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Priced grid</p>
              <CardTitle>Strike matrix</CardTitle>
              <CardDescription>Drag horizontally to inspect the pricing grid. Malformed price rows are excluded by the API.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={ref}
            className="drag-scroll overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/55"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Term</th>
                  <th className="px-5 py-4">Merchant %</th>
                  <th className="px-5 py-4">Cycling</th>
                  <th className="px-5 py-4">Profile</th>
                  <th className="px-5 py-4 text-right">Price / MW / year</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.term}-${row.merchantPct}-${row.cycling}-${row.profile}`}
                    className="border-t border-white/10 transition hover:bg-cyan-300/[0.06]"
                  >
                    <td className="px-5 py-4 font-semibold text-white">{row.term} years</td>
                    <td className="px-5 py-4 text-slate-200">{row.merchantPct}%</td>
                    <td className="px-5 py-4 text-slate-200">{row.cycling.toFixed(1)}x</td>
                    <td className="px-5 py-4 text-slate-200">{profileLabel(row.profile)}</td>
                    <td className="px-5 py-4 text-right font-bold text-cyan-100">{formatAudPerMwYear(row.pricePerMwYr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
