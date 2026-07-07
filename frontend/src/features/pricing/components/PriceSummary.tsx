import { AlertTriangle, CalendarDays, Gauge, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatAudPerMwYear, formatDate, profileLabel } from "@/lib/format";
import { sameCell } from "@/lib/grid";
import type { SelectedTerms, StrikeMatrixItem } from "@/types/pricing";

type Props = {
  requested: SelectedTerms;
  pricedCell: StrikeMatrixItem;
  asOf?: string;
};

export function PriceSummary({ requested, pricedCell, asOf }: Props) {
  const snapped = !sameCell(requested, pricedCell);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
      <Card className="relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <CardContent className="relative grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge>Headline price</Badge>
              {snapped ? (
                <Badge className="border-amber-300/30 bg-amber-300/15 text-amber-100">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Snapped to nearest cell
                </Badge>
              ) : (
                <Badge className="border-emerald-300/30 bg-emerald-300/15 text-emerald-100">Exact grid match</Badge>
              )}
            </div>
            <p className="text-5xl font-black tracking-[-0.06em] text-white md:text-6xl">
              {formatAudPerMwYear(pricedCell.pricePerMwYr)}
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">per MW per year</p>
            {snapped && (
              <p className="mt-4 max-w-xl rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
                Requested {requested.term}y / {requested.merchantPct}% / {requested.cycling.toFixed(1)}x / {profileLabel(requested.profile)} was not priced. Displaying the nearest priced cell instead.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric icon={CalendarDays} label="As of" value={formatDate(asOf)} />
            <Metric icon={Zap} label="Term" value={`${pricedCell.term} years`} />
            <Metric icon={Gauge} label="Merchant exposure" value={`${pricedCell.merchantPct}%`} />
            <Metric icon={Gauge} label="Cycling / profile" value={`${pricedCell.cycling.toFixed(1)}x · ${profileLabel(pricedCell.profile)}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

type MetricProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <div className="metric-card">
      <Icon className="mb-4 h-5 w-5 text-cyan-200" />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
