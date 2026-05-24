"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import { cn } from "@/app/lib/cn";

const STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const AdminOrderDetailPage = () => {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/orders/${params.id}`, { cache: "no-store" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!cancelled && ok) setOrder(d.order);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const updateStatus = async (status) => {
    setSaving(true);
    setMessage("");
    try {
      const r = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOrder(d.order);
      setMessage("Status updated.");
      setTimeout(() => setMessage(""), 2000);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8"><p className="text-white/60">Loading…</p></div>;
  }
  if (!order) {
    return (
      <div className="p-8">
        <p className="text-red-400">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/admin/orders"
        className="text-xs text-white/50 hover:text-white inline-block mb-3"
      >
        ← All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <GradientHeading size="md" className="mb-1">
            #{order._id.slice(-8).toUpperCase()}
          </GradientHeading>
          <p className="text-xs text-white/50">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-white">
            {formatPrice(order.total)}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {order.payment?.razorpayPaymentId ? "Paid via Razorpay" : "Payment pending"}
          </p>
        </div>
      </div>

      {/* Status updater */}
      <div className="border border-white/10 rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
          Update status
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving || order.status === s}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                order.status === s
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-white/20 hover:border-white"
              )}
            >
              {(s || "").replace("_", " ")}
            </button>
          ))}
        </div>
        {message && (
          <p className="text-xs text-green-400 mt-3">{message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items */}
        <div className="border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-4">
            Items ({order.items?.length})
          </h2>
          <ul className="divide-y divide-white/10">
            {order.items?.map((it, i) => (
              <li key={i} className="py-3 flex gap-3">
                <div className="w-14 h-16 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                  {it.imgSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cld(it.imgSrc, { w: 120, crop: "fill" })} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-white/50">
                    Qty {it.quantity} {it.size ? `· Size ${it.size}` : ""}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer + shipping */}
        <div className="space-y-6">
          <div className="border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Customer
            </h2>
            <p className="text-sm text-white">{order.email}</p>
          </div>

          <div className="border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Shipping
            </h2>
            <div className="text-sm text-white/80 leading-relaxed">
              <p className="font-semibold text-white">{order.address?.fullName}</p>
              <p>{order.address?.line1}</p>
              {order.address?.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address?.city}, {order.address?.state} {order.address?.pincode}
              </p>
              <p className="text-white/60 mt-1">{order.address?.phone}</p>
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Payment
            </h2>
            <div className="text-xs text-white/70 space-y-1">
              <p>Provider: {order.payment?.provider || "—"}</p>
              <p>Status: {order.payment?.status || "—"}</p>
              {order.payment?.razorpayPaymentId && (
                <p className="font-mono break-all">
                  Txn: {order.payment.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
