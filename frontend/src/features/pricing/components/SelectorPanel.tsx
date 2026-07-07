import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileLabel } from "@/lib/format";
import type { Profile, SelectedTerms } from "@/types/pricing";

type SelectorOptions = {
  terms: number[];
  merchantPcts: number[];
  cycling: number[];
  profiles: Profile[];
};

type Props = {
  options: SelectorOptions;
  value: SelectedTerms;
  onChange: (next: SelectedTerms) => void;
};

export function SelectorPanel({ options, value, onChange }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <CardHeader>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Deal terms</p>
          <CardTitle>Select pricing levers</CardTitle>
          <CardDescription>
            The lookup uses the selected deal terms. If a requested combination is not priced, the UI snaps to the nearest valid grid cell.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Term"
              helper="Contract length"
              value={String(value.term)}
              options={options.terms.map((term) => ({ label: `${term} years`, value: String(term) }))}
              onChange={(term) => onChange({ ...value, term: Number(term) })}
            />
            <SelectField
              label="Merchant exposure"
              helper="Revenue at risk"
              value={String(value.merchantPct)}
              options={options.merchantPcts.map((merchantPct) => ({ label: `${merchantPct}%`, value: String(merchantPct) }))}
              onChange={(merchantPct) => onChange({ ...value, merchantPct: Number(merchantPct) })}
            />
            <SelectField
              label="Cycling"
              helper="Cycles per day"
              value={String(value.cycling)}
              options={options.cycling.map((cycling) => ({ label: `${cycling.toFixed(1)}x`, value: String(cycling) }))}
              onChange={(cycling) => onChange({ ...value, cycling: Number(cycling) })}
            />
            <SelectField
              label="Profile"
              helper="Shape"
              value={value.profile}
              options={options.profiles.map((profile) => ({ label: profileLabel(profile), value: profile }))}
              onChange={(profile) => onChange({ ...value, profile: profile as Profile })}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

type SelectFieldProps = {
  label: string;
  helper: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

function SelectField({ label, helper, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-white">{label}</label>
        <span className="text-xs font-medium text-muted-foreground">{helper}</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
