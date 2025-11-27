"use client";

import type { FC, PropsWithChildren } from "react";

interface PillProps {
  tone?: "default" | "muted";
  className?: string;
}

const Pill: FC<PropsWithChildren<PillProps>> = ({ tone = "default", className = "", children }) => {
  const base =
    tone === "default"
      ? "rounded-full bg-white/70 px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-white/50 backdrop-blur"
      : "rounded-full bg-white/60 px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-white/40 backdrop-blur";
  return <span className={`${base} ${className}`}>{children}</span>;
};

export default Pill;

