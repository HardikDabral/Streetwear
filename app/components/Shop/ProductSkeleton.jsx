import React from "react";

const Shimmer = ({ className }) => (
  <div className={`bg-white/5 animate-pulse rounded-md ${className || ""}`} />
);

const ProductSkeleton = () => (
  <div className="bg-white/5 rounded-xl overflow-hidden">
    <Shimmer className="aspect-[4/5] w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-4 w-1/3" />
    </div>
  </div>
);

export default ProductSkeleton;
