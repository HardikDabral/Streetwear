"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";

const STATUS_STYLES = {
  pending_payment: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-300 border-green-500/30",
  processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};
const statusLabel = (s) =>
  (s || "unknown").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const OrderDetailContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=/account/orders/${params.id}`);
    }
  }, [authLoading, user, router, params.id]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders/${params.id}`, { cache: "no-store" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) setError(d.error || "Order not found");
        else setOrder(d.order);
      })
      .finally(() => setLoading(false));
  }, [params.id, user]);

  if (authLoading || !user || loading) {
    return (
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-white/60">Loading order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center py-20">
          <p className="text-white/70 mb-6">{error || "Order not found"}</p>
          <Button as={Link} href="/account/orders" variant="ghost">
            Back to orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {justPlaced && (
          <div className="mb-8 border border-green-500/30 bg-green-500/10 rounded-2xl p-6 animate-fade-in">
            <p className="text-2xl font-extrabold text-white mb-2">
              Thank you for your order!
            </p>
            <p className="text-white/70 text-sm">
              Payment successful. We&apos;ll send a confirmation to {order.email}.
            </p>
          </div>
        )}

        <Link
          href="/account/orders"
          className="text-xs text-white/50 hover:text-white inline-block mb-3"
        >
          ← All orders
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
          <div>
            <GradientHeading size="md" className="mb-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </GradientHeading>
            <p className="text-xs text-white/50">
              Placed{" "}
              {new Date(order.createdAt).toLocaleString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_STYLES[order.status] || ""}`}
          >
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Items ({order.items.length})
            </h2>
            <ul className="border border-white/10 rounded-2xl divide-y divide-white/10 overflow-hidden mb-8">
              {order.items.map((it, i) => (
                <li key={i} className="p-4 flex gap-3 items-center">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-white/5">
                    {it.imgSrc && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cld(it.imgSrc, { w: 150, crop: "fill" })} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${it.productId}`}
                      className="text-sm font-semibold text-white hover:underline truncate block"
                    >
                      {it.name}
                    </Link>
                    <p className="text-xs text-white/50 mt-0.5">
                      Qty {it.quantity}
                      {it.size ? ` · Size ${it.size}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>

            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Shipping to
            </h2>
            <div className="border border-white/10 rounded-2xl p-5 text-sm text-white/80 leading-relaxed">
              <p className="font-semibold text-white">{order.address?.fullName}</p>
              <p>{order.address?.line1}</p>
              {order.address?.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address?.city}, {order.address?.state} {order.address?.pincode}
              </p>
              <p>{order.address?.country}</p>
              <p className="mt-2 text-white/60">{order.address?.phone}</p>
            </div>
          </div>

          <aside className="border border-white/10 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-4">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span className="text-white font-semibold">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span className="text-white font-semibold">
                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-white text-xl">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/60 space-y-1">
              <p>
                <span className="text-white/40">Payment:</span>{" "}
                {order.payment?.provider || "—"}
              </p>
              {order.payment?.razorpayPaymentId && (
                <p className="font-mono break-all">
                  <span className="text-white/40">Txn:</span>{" "}
                  {order.payment.razorpayPaymentId}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const OrderDetailPage = () => (
  <Suspense fallback={null}>
    <OrderDetailContent />
  </Suspense>
);

export default OrderDetailPage;
