"use client";

import type { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";

type Variant = "primary" | "soft" | "pill";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "rounded-md bg-indigo-600 px-4 py-2 text-white shadow transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
  soft:
    "rounded-xl bg-gray-800/60 px-3 py-2 text-gray-100 ring-1 ring-gray-700 transition hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
  pill:
    "rounded-full bg-white/70 px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-white/50 backdrop-blur",
};

const Button: FC<PropsWithChildren<ButtonProps>> = ({ variant = "primary", className = "", children, ...rest }) => {
  const base = variantClasses[variant];
  return (
    <button type="button" className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;

