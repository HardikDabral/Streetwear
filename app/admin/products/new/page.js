"use client";

import React from "react";
import Link from "next/link";
import GradientHeading from "@/app/components/ui/GradientHeading";
import ProductForm from "@/app/components/Admin/ProductForm";

const NewProductPage = () => {
  return (
    <div className="p-8 max-w-7xl">
      <Link
        href="/admin/products"
        className="text-xs text-white/50 hover:text-white inline-block mb-3"
      >
        ← Back to products
      </Link>
      <GradientHeading size="md" className="mb-6">
        New Product
      </GradientHeading>
      <ProductForm />
    </div>
  );
};

export default NewProductPage;
