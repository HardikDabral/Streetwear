"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import ImageUploader from "./ImageUploader";
import { cn } from "@/app/lib/cn";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const Field = ({ label, hint, children, className }) => (
  <div className={className}>
    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-white/40 mt-1">{hint}</p>}
  </div>
);

const input =
  "w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50";

const ProductForm = ({ initial, productId }) => {
  const router = useRouter();
  const isEdit = !!productId;

  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price ?? "",
    category: initial?.category || "",
    stock: initial?.stock ?? 0,
    sizes: Array.isArray(initial?.sizes) ? initial.sizes : [],
    imgSrc: Array.isArray(initial?.imgSrc) ? initial.imgSrc : [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleSize = (s) =>
    update({
      sizes: form.sizes.includes(s)
        ? form.sizes.filter((x) => x !== s)
        : [...form.sizes, s],
    });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.description || !form.category || form.price === "") {
      setError("Name, description, category, and price are required");
      return;
    }
    if (form.imgSrc.length === 0) {
      setError("Add at least one image");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/products");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/products");
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main */}
      <div className="lg:col-span-2 space-y-5">
        <div className="border border-white/10 rounded-2xl p-6 space-y-5">
          <Field label="Name *">
            <input
              className={input}
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Karmic Hoodie"
            />
          </Field>

          <Field label="Description *">
            <textarea
              className={cn(input, "min-h-[140px]")}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Premium 100% cotton hoodie..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category *">
              <input
                className={input}
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                placeholder="Hoodie"
              />
            </Field>
            <Field label="Price (₹) *">
              <input
                type="number"
                min="0"
                className={input}
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
                placeholder="1499"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock">
              <input
                type="number"
                min="0"
                className={input}
                value={form.stock}
                onChange={(e) => update({ stock: e.target.value })}
              />
            </Field>
            <Field label="Available sizes">
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSize(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all",
                      form.sizes.includes(s)
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/70 border-white/20 hover:border-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl p-6">
          <Field
            label="Images *"
            hint="First image is the main thumbnail shown on the catalog."
          >
            <ImageUploader
              images={form.imgSrc}
              onChange={(imgSrc) => update({ imgSrc })}
            />
          </Field>
        </div>
      </div>

      {/* Sidebar actions */}
      <aside className="space-y-4">
        <div className="border border-white/10 rounded-2xl p-6 space-y-3 lg:sticky lg:top-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
            {isEdit ? "Save changes" : "Publish product"}
          </h3>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="gradient"
            size="md"
            className="w-full"
            disabled={busy}
          >
            {busy ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={handleDelete}
            >
              Delete product
            </Button>
          )}
        </div>
      </aside>
    </form>
  );
};

export default ProductForm;
