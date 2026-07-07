import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAudPerMwYear } from "@/lib/format";
import type { PnlCurve } from "@/types/pricing";

type Props = {
  curve: PnlCurve;
};

export function PnlChart({ curve }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card>
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Risk profile</p>
          <CardTitle>P&amp;L distribution by percentile</CardTitle>
          <CardDescription>
            Recharts is used because it gives a reliable responsive SVG chart, accessible tooltips, labelled axes, and a clean reference line with very little bespoke charting code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[390px] rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve.points} margin={{ top: 20, right: 24, bottom: 24, left: 24 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
                <XAxis
                  dataKey="p"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#b8c3d6", fontSize: 12 }}
                  label={{ value: "Percentile p", position: "insideBottom", offset: -12, fill: "#b8c3d6" }}
                />
                <YAxis
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#b8c3d6", fontSize: 12 }}
                  label={{ value: "AUD / MW / year", angle: -90, position: "insideLeft", fill: "#b8c3d6" }}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(45, 212, 191, 0.35)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "rgba(2, 8, 23, 0.95)",
                    border: "1px solid rgba(45, 212, 191, 0.25)",
                    borderRadius: 16,
                    color: "#fff",
                  }}
                  formatter={(value) => [formatAudPerMwYear(Number(value)), "P&L per MW / year"]}
                  labelFormatter={(label) => `p${label}`}
                />
                <ReferenceLine
                  y={curve.strikePerMwYr}
                  stroke="#fbbf24"
                  strokeDasharray="7 7"
                  label={{ value: `Strike ${formatAudPerMwYear(curve.strikePerMwYr)}`, fill: "#fde68a", position: "insideTopRight" }}
                />
                <Line
                  type="monotone"
                  dataKey="pnlPerMwYr"
                  stroke="#2dd4bf"
                  strokeWidth={4}
                  dot={{ r: 5, fill: "#2dd4bf", stroke: "#07111f", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#67e8f9", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
