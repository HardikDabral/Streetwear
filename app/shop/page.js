"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GradientHeading from "@/app/components/ui/GradientHeading";
import ProductCard from "@/app/components/Product/ProductCard";
import ProductSkeleton from "@/app/components/Shop/ProductSkeleton";
import Filters from "@/app/components/Shop/Filters";
import Button from "@/app/components/ui/Button";
import { cn } from "@/app/lib/cn";
import { CloseIcon } from "@/app/components/ui/Icons";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name: A → Z" },
];

const buildQuery = (state) => {
  const sp = new URLSearchParams();
  if (state.q) sp.set("q", state.q);
  if (state.categories.length) sp.set("category", state.categories.join(","));
  if (state.sizes.length) sp.set("sizes", state.sizes.join(","));
  if (state.minPrice != null) sp.set("minPrice", String(state.minPrice));
  if (state.maxPrice != null) sp.set("maxPrice", String(state.maxPrice));
  if (state.sort && state.sort !== "newest") sp.set("sort", state.sort);
  if (state.page && state.page > 1) sp.set("page", String(state.page));
  return sp.toString();
};

const ShopContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState({ products: [], total: 0, totalPages: 1, facets: { categories: [] } });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const state = useMemo(() => {
    return {
      q: searchParams.get("q") || "",
      categories: (searchParams.get("category") || "").split(",").filter(Boolean),
      sizes: (searchParams.get("sizes") || "").split(",").filter(Boolean),
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      sort: searchParams.get("sort") || "newest",
      page: Number(searchParams.get("page") || 1),
    };
  }, [searchParams]);

  const updateState = useCallback(
    (patch) => {
      const next = { ...state, ...patch, page: patch.page ?? 1 };
      const qs = buildQuery(next);
      router.replace(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, state]
  );

  const clearAll = useCallback(() => {
    router.replace("/shop", { scroll: false });
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = buildQuery(state);
    fetch(`/api/products${qs ? `?${qs}` : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setData({
          products: d.products || [],
          total: d.total || 0,
          totalPages: d.totalPages || 1,
          facets: d.facets || { categories: [] },
        });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [state]);

  const hasActiveFilters =
    state.q ||
    state.categories.length ||
    state.sizes.length ||
    state.minPrice != null ||
    state.maxPrice != null;

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <GradientHeading size="lg" className="mb-2">
            Shop
          </GradientHeading>
          <p className="text-white/60 text-sm md:text-base">
            {state.q
              ? `Results for "${state.q}"`
              : "Browse the full Karmic Vision collection."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <Filters
              categories={data.facets.categories}
              selectedCategories={state.categories}
              selectedSizes={state.sizes}
              minPrice={state.minPrice}
              maxPrice={state.maxPrice}
              onChange={updateState}
              onClear={clearAll}
            />
          </aside>

          {/* Main */}
          <div>
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <p className="text-sm text-white/60">
                {loading ? "Loading…" : `${data.total} ${data.total === 1 ? "product" : "products"}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden px-4 py-2 rounded-full border border-white/20 text-sm font-semibold hover:bg-white/5"
                >
                  Filters
                </button>
                <div className="relative">
                  <select
                    value={state.sort}
                    onChange={(e) => updateState({ sort: e.target.value })}
                    className="appearance-none bg-white/5 border border-white/20 rounded-full pl-4 pr-10 py-2 text-sm font-semibold text-white focus:outline-none focus:border-white/50 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-black">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {state.categories.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      updateState({ categories: state.categories.filter((x) => x !== c) })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white hover:bg-white/20"
                  >
                    {c}
                    <CloseIcon width={12} height={12} />
                  </button>
                ))}
                {state.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      updateState({ sizes: state.sizes.filter((x) => x !== s) })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white hover:bg-white/20"
                  >
                    Size: {s}
                    <CloseIcon width={12} height={12} />
                  </button>
                ))}
                {state.q && (
                  <button
                    onClick={() => updateState({ q: "" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white hover:bg-white/20"
                  >
                    Search: {state.q}
                    <CloseIcon width={12} height={12} />
                  </button>
                )}
                {(state.minPrice != null || state.maxPrice != null) && (
                  <button
                    onClick={() =>
                      updateState({ minPrice: undefined, maxPrice: undefined })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white hover:bg-white/20"
                  >
                    ₹{state.minPrice ?? 0} — ₹{state.maxPrice ?? "∞"}
                    <CloseIcon width={12} height={12} />
                  </button>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : data.products.length === 0 ? (
              <div className="border border-dashed border-white/20 rounded-2xl py-20 text-center">
                <p className="text-white/70 mb-4">No products match those filters.</p>
                <Button variant="ghost" onClick={clearAll}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {data.products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => updateState({ page: state.page - 1 })}
                      disabled={state.page <= 1}
                      className="px-4 py-2 rounded-full border border-white/20 text-sm disabled:opacity-30 hover:bg-white/5"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-white/60 px-3">
                      Page {state.page} of {data.totalPages}
                    </span>
                    <button
                      onClick={() => updateState({ page: state.page + 1 })}
                      disabled={state.page >= data.totalPages}
                      className="px-4 py-2 rounded-full border border-white/20 text-sm disabled:opacity-30 hover:bg-white/5"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-white/10 p-6 overflow-y-auto animate-slide-in-right">
            <Filters
              categories={data.facets.categories}
              selectedCategories={state.categories}
              selectedSizes={state.sizes}
              minPrice={state.minPrice}
              maxPrice={state.maxPrice}
              onChange={updateState}
              onClear={clearAll}
              mobileOnClose={() => setMobileFiltersOpen(false)}
            />
            <div className="mt-6">
              <Button
                onClick={() => setMobileFiltersOpen(false)}
                variant="gradient"
                className="w-full"
              >
                Show {data.total} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopFallback = () => (
  <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6">
      <p className="text-white/60">Loading shop…</p>
    </div>
  </div>
);

const ShopPage = () => (
  <Suspense fallback={<ShopFallback />}>
    <ShopContent />
  </Suspense>
);

export default ShopPage;
