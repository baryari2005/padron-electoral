"use client";

import { ArrowUpRight, ArrowDownRight, ArrowUp, Minus, TrendingUp } from "lucide-react";

type Thresholds = { low: number; mid: number };

export default function PercentPill({
  value,                 // 0..100
  // MODO 1: por tiers (umbral de porcentaje)
  tiers = false,         // si true, ignora delta y usa thresholds
  thresholds,            // { low, mid } -> default {40, 60}
  // MODO 2: por delta (tendencia)
  delta,                 // número (+/-). Si tiers=false y delta es number, usa flecha según delta
  className = "",
}: {
  value: number;
  tiers?: boolean;
  thresholds?: Thresholds;
  delta?: number;
  className?: string;
}) {
  const t: Thresholds = { low: 40, mid: 60, ...(thresholds ?? {}) };

  let Icon = Minus;
  let color = "text-slate-300";

  if (tiers) {
    if (value <= t.low) {
      Icon = ArrowDownRight;
      //color = "text-rose-400";
    } else if (value <= t.mid) {
      Icon = TrendingUp;
      //color = "text-amber-400";
    } else {
      Icon = ArrowUpRight;
      //color = "text-emerald-400";
    }
  } else if (typeof delta === "number") {
    if (delta > 0) {
      Icon = ArrowUpRight;
      //color = "text-emerald-400";
    } else if (delta < 0) {
      Icon = ArrowDownRight;
      //color = "text-rose-400";
    } else {
      Icon = Minus;
      //color = "text-slate-300";
    }
  } else {
    // sin tiers ni delta -> sin flecha
    Icon = Minus;
    //color = "text-slate-300";
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-black text-white px-2 py-0.5 text-xs font-semibold ${className}`}>
      {Math.round(value)}%
      <Icon className={`w-4 h-4 ${color}`} aria-hidden />
    </span>
  );
}
