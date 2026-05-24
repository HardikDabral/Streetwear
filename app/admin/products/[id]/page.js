"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GradientHeading from "@/app/components/ui/GradientHeading";
import ProductForm from "@/app/components/Admin/ProductForm";

const EditProductPage = () => {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`, { cache: "no-store" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) setError(d.error || "Failed to load");
        else setProduct(d.product);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="p-8 max-w-7xl">
      <Link
        href="/admin/products"
        className="text-xs text-white/50 hover:text-white inline-block mb-3"
      >
        ← Back to products
      </Link>
      {loading ? (
        <p className="text-white/60">Loading product…</p>
      ) : error || !product ? (
        <p className="text-red-400">{error || "Not found"}</p>
      ) : (
        <>
          <GradientHeading size="md" className="mb-6">
            Edit Product
          </GradientHeading>
          <ProductForm initial={product} productId={product._id} />
        </>
      )}
    </div>
  );
};

export default EditProductPage;
