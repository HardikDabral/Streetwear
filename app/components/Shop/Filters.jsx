"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/cn";
import { ChevronDown, CloseIcon } from "../ui/Icons";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const FilterGroup = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left text-sm font-bold text-white uppercase tracking-wider"
      >
        {title}
        <ChevronDown
          width={16}
          height={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

const Checkbox = ({ checked, onChange, label, count }) => (
  <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80 hover:text-white">
    <span
      className={cn(
        "w-4 h-4 rounded border flex items-center justify-center transition-all",
        checked
          ? "bg-white border-white"
          : "border-white/30"
      )}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className="flex-1">{label}</span>
    {count != null && <span className="text-xs text-white/40">{count}</span>}
  </label>
);

const Filters = ({
  categories = [],
  selectedCategories = [],
  selectedSizes = [],
  minPrice,
  maxPrice,
  onChange,
  onClear,
  className,
  mobileOnClose,
}) => {
  const toggleCategory = (cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    onChange({ categories: next });
  };

  const toggleSize = (s) => {
    const next = selectedSizes.includes(s)
      ? selectedSizes.filter((x) => x !== s)
      : [...selectedSizes, s];
    onChange({ sizes: next });
  };

  return (
    <div className={cn("text-white", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-extrabold tracking-wide">Filters</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-xs text-white/60 hover:text-white underline-offset-4 hover:underline"
          >
            Clear all
          </button>
          {mobileOnClose && (
            <button
              onClick={mobileOnClose}
              className="lg:hidden text-white/70 hover:text-white"
              aria-label="Close filters"
            >
              <CloseIcon width={20} height={20} />
            </button>
          )}
        </div>
      </div>

      <FilterGroup title="Category">
        {categories.length === 0 && (
          <p className="text-xs text-white/40">No categories yet</p>
        )}
        {categories.map((cat) => (
          <Checkbox
            key={cat}
            label={cat}
            checked={selectedCategories.includes(cat)}
            onChange={() => toggleCategory(cat)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice ?? ""}
            onChange={(e) =>
              onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full bg-white/5 border border-white/20 rounded-md px-2 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
          />
          <span className="text-white/40">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ""}
            onChange={(e) =>
              onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full bg-white/5 border border-white/20 rounded-md px-2 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Sizes">
        <div className="grid grid-cols-3 gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={cn(
                "px-2 py-1.5 rounded-md text-xs font-semibold border transition-all",
                selectedSizes.includes(s)
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/80 border-white/20 hover:border-white/50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
};

export default Filters;
