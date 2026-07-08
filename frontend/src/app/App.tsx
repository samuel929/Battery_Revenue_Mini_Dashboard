import { motion } from "framer-motion";
import { BatteryCharging, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PnlChart } from "@/features/pricing/components/PnlChart";
import { PriceSummary } from "@/features/pricing/components/PriceSummary";
import { PricingTable } from "@/features/pricing/components/PricingTable";
import { SelectorPanel } from "@/features/pricing/components/SelectorPanel";
import { EmptyState, ErrorState, LoadingState } from "@/features/pricing/components/StateViews";
import { usePricingData } from "@/features/pricing/hooks/usePricingData";

export default function App() {
  const { matrix, selection, setSelection, curve, matrixStatus, curveStatus, error, options, pricedCell, reload } = usePricingData();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      <div className="space-y-6">
        {matrixStatus === "loading" && <LoadingState message="Loading the pricing grid from the Python API…" />}
        {matrixStatus === "empty" && <EmptyState message="No priced cells were returned by the API." />}
        {matrixStatus === "error" && <ErrorState message={error ?? "Could not load pricing grid."} onRetry={reload} />}

        {matrixStatus === "success" && pricedCell && (
          <>
            <SelectorPanel options={options} value={selection} onChange={setSelection} />
            <PriceSummary requested={selection} pricedCell={pricedCell} asOf={curve?.asOf} />
            {curveStatus === "loading" && <LoadingState message="Loading the P&L curve for the selected priced cell…" />}
            {curveStatus === "error" && <ErrorState message={error ?? "Could not load P&L curve."} />}
            {curveStatus === "success" && curve && <PnlChart curve={curve} />}
            <PricingTable rows={matrix} />
          </>
        )}
      </div>
    </main>
  );
}

function Hero() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-glow backdrop-blur-xl md:p-8"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-semibold text-cyan-100">
            <BatteryCharging className="h-4 w-4" /> Grid-scale battery pricing
          </div>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">
            Pricing workbench for contract risk review.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Select deal terms, see the exact priced cell or an honest nearest-cell snap, and review the P&amp;L distribution with a strike reference line.
          </p>
        </div>
        
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">Open API docs</a>
        </Button>
        <Button variant="secondary" asChild>
          <a href="#pricing-grid">Review priced grid</a>
        </Button>
      </div>
    </motion.header>
  );
}


