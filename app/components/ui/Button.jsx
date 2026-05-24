"use client";

import React from "react";
import { cn } from "@/app/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50";

const variants = {
  primary:
    "bg-white text-black hover:bg-black hover:text-white border border-white/10 shadow-lg",
  invert:
    "bg-black text-white hover:bg-white hover:text-black border border-white/30",
  ghost: "bg-transparent text-white hover:bg-white/10 border border-white/20",
  gradient:
    "bg-white text-black font-extrabold shadow-lg hover:bg-black hover:text-white border border-white/10",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const Button = React.forwardRef(
  (
    { variant = "primary", size = "md", as: Comp = "button", className, ...props },
    ref
  ) => {
    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
