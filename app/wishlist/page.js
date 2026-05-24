"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/app/contexts/WishlistContext";
import ProductCard from "@/app/components/Product/ProductCard";
import ProductSkeleton from "@/app/components/Shop/ProductSkeleton";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import { HeartIcon } from "@/app/components/ui/Icons";

const WishlistPage = () => {
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      setProducts(results.filter((r) => r?.product).map((r) => r.product));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 md:mb-12">
          <GradientHeading size="lg">Your Wishlist</GradientHeading>
          <p className="text-white/60 text-sm md:text-base mt-2">
            {ids.length === 0
              ? "Save the pieces you love — they'll show up here."
              : `${ids.length} ${ids.length === 1 ? "item" : "items"} saved`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-white/20 rounded-2xl py-20 text-center">
            <HeartIcon width={80} height={80} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/70 mb-6">
              Your wishlist is empty. Start hearting things you love.
            </p>
            <Button as={Link} href="/shop" variant="gradient" size="lg">
              Discover products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
