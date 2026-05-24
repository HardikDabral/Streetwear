"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import {
  CartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@/app/components/ui/Icons";

const SHIPPING_FREE_AT = 2000;

const CartPage = () => {
  const { items, updateQuantity, removeItem, hydrated } = useCart();
  const [details, setDetails] = useState({});

  useEffect(() => {
    const missing = items.map((it) => it.productId).filter((id) => !details[id]);
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      const next = { ...details };
      results.forEach((r, i) => {
        if (r?.product) next[missing[i]] = r.product;
      });
      setDetails(next);
    });
  }, [items, details]);

  const subtotal = items.reduce((sum, it) => {
    const p = details[it.productId];
    return sum + (p?.price || 0) * it.quantity;
  }, 0);
  const shipping = subtotal >= SHIPPING_FREE_AT || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (hydrated && items.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 text-center py-20">
          <CartIcon width={80} height={80} className="mx-auto text-white/20 mb-6" />
          <GradientHeading size="md" className="mb-3">Your cart is empty</GradientHeading>
          <p className="text-white/60 mb-8">
            Looks like you haven&apos;t added anything yet. Let&apos;s fix that.
          </p>
          <Button as={Link} href="/shop" variant="gradient" size="lg">
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <GradientHeading size="lg" className="mb-8">
          Shopping Cart
        </GradientHeading>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Items */}
          <div className="border border-white/10 rounded-2xl divide-y divide-white/10 overflow-hidden">
            {items.map((it) => {
              const p = details[it.productId];
              return (
                <div
                  key={`${it.productId}-${it.size}`}
                  className="p-4 md:p-6 flex gap-4"
                >
                  <Link
                    href={`/product/${it.productId}`}
                    className="flex-shrink-0 w-24 h-32 md:w-32 md:h-40 rounded-lg overflow-hidden bg-white/5"
                  >
                    {p?.imgSrc?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cld(p.imgSrc[0], { w: 300, crop: "fill" })} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${it.productId}`}
                          className="text-base md:text-lg font-semibold text-white hover:underline truncate block"
                        >
                          {p?.name || "Loading…"}
                        </Link>
                        {p?.category && (
                          <p className="text-xs text-white/50 mt-0.5">{p.category}</p>
                        )}
                        {it.size && (
                          <p className="text-xs text-white/70 mt-1">
                            Size: <span className="text-white">{it.size}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(it.productId, it.size)}
                        className="text-white/40 hover:text-red-400 self-start"
                        aria-label="Remove"
                      >
                        <TrashIcon width={18} height={18} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="inline-flex items-center border border-white/20 rounded-full">
                        <button
                          onClick={() =>
                            updateQuantity(it.productId, it.size, Math.max(0, it.quantity - 1))
                          }
                          className="w-9 h-9 inline-flex items-center justify-center text-white/80 hover:text-white"
                          aria-label="Decrease"
                        >
                          <MinusIcon width={14} height={14} />
                        </button>
                        <span className="w-9 text-center text-sm font-bold text-white">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(it.productId, it.size, Math.min(99, it.quantity + 1))
                          }
                          className="w-9 h-9 inline-flex items-center justify-center text-white/80 hover:text-white"
                          aria-label="Increase"
                        >
                          <PlusIcon width={14} height={14} />
                        </button>
                      </div>
                      <p className="text-base md:text-lg font-bold">
                        {p ? formatPrice(p.price * it.quantity) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 self-start border border-white/10 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-extrabold uppercase tracking-wider mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-white/70">
                <span>Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Shipping</span>
                <span className="text-white font-semibold">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              {subtotal > 0 && subtotal < SHIPPING_FREE_AT && (
                <div className="bg-white/5 rounded-lg p-3 text-xs text-white/70">
                  Add {formatPrice(SHIPPING_FREE_AT - subtotal)} more for free shipping.
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-white text-xl">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <Button
              as={Link}
              href="/checkout"
              variant="gradient"
              size="lg"
              className="w-full"
            >
              Proceed to Checkout
            </Button>
            <Button
              as={Link}
              href="/shop"
              variant="ghost"
              className="w-full mt-3"
            >
              Continue shopping
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
