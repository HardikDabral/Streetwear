"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/app/lib/cn";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useCart } from "@/app/contexts/CartContext";
import { useUI } from "@/app/contexts/UIContext";
import { HeartIcon, CartIcon } from "../ui/Icons";

const ProductCard = ({ product, className }) => {
  const { has, toggle } = useWishlist();
  const { addItem } = useCart();
  const { openCart } = useUI();
  const [imgIdx, setImgIdx] = useState(0);

  const wishlisted = has(product._id);
  const images = product.imgSrc || [];
  const hover = images[1] || images[0];

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, { quantity: 1 });
    openCart();
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
  };

  return (
    <Link
      href={`/product/${product._id}`}
      className={cn(
        "group relative bg-white text-black rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300",
        className
      )}
      onMouseEnter={() => images[1] && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      {/* Category ribbon */}
      {product.category && (
        <span className="absolute top-3 left-3 z-10 bg-black/80 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide backdrop-blur-sm">
          {product.category}
        </span>
      )}

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className={cn(
          "absolute top-3 right-3 z-10 transition-all hover:scale-110",
          wishlisted ? "text-red-500" : "text-black/70 hover:text-black"
        )}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon width={22} height={22} filled={wishlisted} />
      </button>

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {images.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cld(imgIdx === 1 ? hover : images[0], { w: 600, crop: "fill" })}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Quick add overlay */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-3 left-3 right-3 bg-black text-white text-sm font-semibold py-2.5 rounded-full opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-black inline-flex items-center justify-center gap-2"
        >
          <CartIcon width={16} height={16} /> Quick Add
        </button>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm sm:text-base font-bold mt-1">
          {formatPrice(product.price)}
        </p>
        {product.sizes && product.sizes.length > 0 && (
          <p className="text-[11px] text-black/50 mt-1">
            {product.sizes.slice(0, 5).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
