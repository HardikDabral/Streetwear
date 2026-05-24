"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/cn";
import { cld } from "@/app/lib/image";

const ProductGallery = ({ images = [], alt = "" }) => {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : [null];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[88px_1fr] gap-3 sm:gap-4">
      {/* Thumbnails */}
      <div className="order-2 sm:order-1 flex sm:flex-col gap-2 sm:max-h-[600px] sm:overflow-y-auto">
        {safeImages.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "flex-shrink-0 w-20 h-24 sm:w-full sm:h-24 rounded-lg overflow-hidden border-2 transition-all",
              active === i ? "border-white" : "border-white/10 hover:border-white/40"
            )}
            aria-label={`View image ${i + 1}`}
          >
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cld(src, { w: 200, crop: "fill" })} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            )}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="order-1 sm:order-2 relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/5">
        {safeImages[active] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cld(safeImages[active], { w: 1200 })}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
