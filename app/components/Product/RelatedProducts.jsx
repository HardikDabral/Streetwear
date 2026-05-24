"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "../Shop/ProductSkeleton";

const RelatedProducts = ({ category, excludeId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ limit: "4" });
    if (category) params.set("category", category);
    if (excludeId) params.set("exclude", excludeId);

    fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.products || []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category, excludeId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-20 md:mt-28">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6">
        You may also like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
};

export default RelatedProducts;
