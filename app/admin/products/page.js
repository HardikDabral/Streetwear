"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import { PlusIcon, SearchIcon } from "@/app/components/ui/Icons";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async (query = "") => {
    setLoading(true);
    const url = query ? `/api/admin/products?q=${encodeURIComponent(query)}` : "/api/admin/products";
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <GradientHeading size="lg" className="!leading-tight">
            Products
          </GradientHeading>
          <p className="text-white/60 text-sm mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} in catalog
          </p>
        </div>
        <Button as={Link} href="/admin/products/new" variant="gradient">
          <PlusIcon width={16} height={16} />
          New product
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2.5 max-w-md focus-within:border-white/50">
        <SearchIcon className="text-white/60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") load(q);
          }}
          placeholder="Search by name or category…"
          className="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-sm"
        />
        {q && (
          <button
            onClick={() => {
              setQ("");
              load("");
            }}
            className="text-white/50 hover:text-white text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-white/60">Loading…</p>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-white/20 rounded-2xl p-16 text-center">
          <p className="text-white/70 mb-4">No products yet.</p>
          <Button as={Link} href="/admin/products/new" variant="gradient">
            Create your first product
          </Button>
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-16">Image</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="w-12 h-14 rounded-md overflow-hidden bg-white/5">
                      {p.imgSrc?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cld(p.imgSrc[0], { w: 100, crop: "fill" })} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="font-semibold text-white hover:underline"
                    >
                      {p.name}
                    </Link>
                    {p.sizes?.length > 0 && (
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {p.sizes.join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        p.stock > 0 ? "text-white/80" : "text-red-400"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="text-xs text-white/70 hover:text-white underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
