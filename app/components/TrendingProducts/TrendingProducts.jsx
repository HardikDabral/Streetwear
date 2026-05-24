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

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
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
