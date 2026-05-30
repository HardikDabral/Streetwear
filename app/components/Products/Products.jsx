"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import otherProduct from "@/public/images/otherProduct.png";
import ProductCard from "../Product/ProductCard";
import ProductSkeleton from "../Shop/ProductSkeleton";
import Button from "../ui/Button";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch a wide slice, then exclude hoodies client-side (kept simple, no NOT-IN param yet)
        const res = await fetch("/api/products?limit=24", { cache: "no-store" });
        const data = await res.json();
        const filtered = (data.products || []).filter(
          (p) => p.category !== "Hoodie"
        );
        setProducts(filtered.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="bg-black text-white pt-0 pb-16 mt-[-30px]">
      <div className="w-full text-center mb-8">
        <Image
          src={otherProduct}
          alt="Other Products"
          className="mx-auto rounded-lg shadow-lg w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] h-auto"
        />
      </div>

      {/* Mobile: 2-col grid */}
      <div className="md:hidden grid grid-cols-2 gap-2 px-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((p) => (
              <ProductCard key={p._id} product={p} className="block" />
            ))}
      </div>

      {/* Desktop: infinite scrolling carousel */}
      <div className="hidden md:block mx-auto max-w-[1440px] px-2 sm:px-3 overflow-hidden">
        {loading ? (
          <div className="flex gap-3 pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[300px] lg:w-[320px]">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 pb-2 w-max animate-scroll">
            {[...products, ...products].map((p, i) => (
              <div key={`${p._id}-${i}`} className="flex-shrink-0 w-[300px] lg:w-[320px]">
                <ProductCard product={p} className="block" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-10">
        <Button as={Link} href="/shop" variant="primary" size="lg">
          View All Products
        </Button>
      </div>
    </section>
  );
};

export default Products;
