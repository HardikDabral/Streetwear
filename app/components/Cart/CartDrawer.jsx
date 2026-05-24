"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUI } from "@/app/contexts/UIContext";
import { useCart } from "@/app/contexts/CartContext";
import { formatPrice } from "@/app/lib/format";
import Button from "../ui/Button";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, CartIcon } from "../ui/Icons";
import { cn } from "@/app/lib/cn";
import { cld } from "@/app/lib/image";

const CartDrawer = () => {
  const { cartOpen, closeCart } = useUI();
  const { items, updateQuantity, removeItem } = useCart();
  const [details, setDetails] = useState({}); // productId -> product

  // Fetch product details for items in cart
  useEffect(() => {
    if (!cartOpen || items.length === 0) return;
    const missing = items
      .map((it) => it.productId)
      .filter((id) => !details[id]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      const next = { ...details };
      results.forEach((p, i) => {
        if (p && p.product) next[missing[i]] = p.product;
      });
      setDetails(next);
    });
  }, [cartOpen, items, details]);

  // Lock body scroll while open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const subtotal = items.reduce((sum, it) => {
    const p = details[it.productId];
    return sum + (p?.price || 0) * it.quantity;
  }, 0);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <CartIcon /> Your Cart
            <span className="text-sm text-white/50 font-normal">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </h2>
          <button
            onClick={closeCart}
            className="text-white/70 hover:text-white"
            aria-label="Close cart"
          >
            <CloseIcon width={24} height={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <CartIcon width={64} height={64} className="text-white/20 mb-4" />
              <p className="text-white/70 mb-6">Your cart is empty.</p>
              <Button onClick={closeCart} as={Link} href="/shop" variant="gradient">
                Start shopping
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {items.map((it) => {
                const p = details[it.productId];
                return (
                  <li key={`${it.productId}-${it.size}`} className="p-4 flex gap-3">
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {p?.imgSrc?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cld(p.imgSrc[0], { w: 200, crop: "fill" })}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${it.productId}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-white truncate hover:underline"
                        >
                          {p?.name || "Loading…"}
                        </Link>
                        <button
                          onClick={() => removeItem(it.productId, it.size)}
                          className="text-white/40 hover:text-red-400"
                          aria-label="Remove"
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                      {it.size && (
                        <p className="text-xs text-white/50 mt-0.5">Size: {it.size}</p>
                      )}
                      <p className="text-sm text-white mt-1 font-semibold">
                        {p ? formatPrice(p.price) : "—"}
                      </p>
                      <div className="mt-2 inline-flex items-center border border-white/20 rounded-full">
                        <button
                          onClick={() =>
                            updateQuantity(it.productId, it.size, Math.max(0, it.quantity - 1))
                          }
                          className="w-8 h-8 inline-flex items-center justify-center text-white/80 hover:text-white"
                          aria-label="Decrease"
                        >
                          <MinusIcon width={14} height={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-white">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(it.productId, it.size, Math.min(99, it.quantity + 1))
                          }
                          className="w-8 h-8 inline-flex items-center justify-center text-white/80 hover:text-white"
                          aria-label="Increase"
                        >
                          <PlusIcon width={14} height={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-5 space-y-3">
            <div className="flex justify-between text-white/70 text-sm">
              <span>Subtotal</span>
              <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-white/50">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button as={Link} href="/cart" variant="ghost" onClick={closeCart}>
                View Cart
              </Button>
              <Button as={Link} href="/checkout" variant="gradient" onClick={closeCart}>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
