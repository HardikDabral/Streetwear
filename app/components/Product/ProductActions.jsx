"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/cn";
import Button from "../ui/Button";
import { useCart } from "@/app/contexts/CartContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useUI } from "@/app/contexts/UIContext";
import { HeartIcon, CartIcon, MinusIcon, PlusIcon } from "../ui/Icons";

const ProductActions = ({ product }) => {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { openCart } = useUI();

  const sizes = product.sizes || [];
  const [size, setSize] = useState(sizes[0] || null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  const wishlisted = has(product._id);
  const outOfStock = (product.stock || 0) <= 0;

  const handleAdd = () => {
    if (sizes.length > 0 && !size) {
      setError("Please select a size");
      return;
    }
    setError("");
    addItem(product, { quantity: qty, size });
    openCart();
  };

  return (
    <div>
      {/* Stock indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={cn(
            "inline-block w-2 h-2 rounded-full",
            outOfStock ? "bg-red-500" : "bg-green-500"
          )}
        />
        <span className="text-xs text-white/70">
          {outOfStock
            ? "Out of stock"
            : product.stock < 5
            ? `Only ${product.stock} left`
            : "In stock"}
        </span>
      </div>

      {/* Size selector */}
      {sizes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              Size
            </p>
            <button className="text-xs text-white/50 hover:text-white underline">
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
                className={cn(
                  "min-w-[44px] h-11 px-3 rounded-md text-sm font-semibold border-2 transition-all",
                  size === s
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:border-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      )}

      {/* Quantity */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">
          Quantity
        </p>
        <div className="inline-flex items-center border border-white/20 rounded-full">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 inline-flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Decrease"
          >
            <MinusIcon width={14} height={14} />
          </button>
          <span className="w-10 text-center text-sm font-bold text-white">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="w-10 h-10 inline-flex items-center justify-center text-white/80 hover:text-white"
            aria-label="Increase"
          >
            <PlusIcon width={14} height={14} />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button
          onClick={handleAdd}
          disabled={outOfStock}
          variant="gradient"
          size="lg"
          className="flex-1"
        >
          <CartIcon width={18} height={18} />
          {outOfStock ? "Out of stock" : "Add to Cart"}
        </Button>
        <Button
          onClick={() => toggle(product._id)}
          variant={wishlisted ? "primary" : "invert"}
          size="lg"
          className="flex-1 sm:flex-none"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon filled={wishlisted} />
          <span className="sm:hidden">
            {wishlisted ? "Wishlisted" : "Wishlist"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
