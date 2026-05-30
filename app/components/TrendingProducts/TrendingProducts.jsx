"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import trendingImage from "../../../public/images/trending.png";
import ProductCard from "../Product/ProductCard";
import ProductSkeleton from "../Shop/ProductSkeleton";
import Button from "../ui/Button";

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products?category=Hoodie&limit=8", {
          cache: "no-store",
        });
        const data = await res.json();
        setProducts(data.products || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="trending-products" className="bg-black text-white py-12 md:py-16">
      <div className="w-full text-center mb-8">
        <Image
          src={trendingImage}
          alt="Trending Products"
          width={800}
          height={400}
          className="mx-auto rounded-lg shadow-lg"
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
        <Button as={Link} href="/shop?category=Hoodie" variant="primary" size="lg">
          View All Hoodies
        </Button>
      </div>
    </section>
  );
};

export default TrendingProducts;
