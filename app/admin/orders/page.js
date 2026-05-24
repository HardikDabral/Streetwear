"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/format";
import GradientHeading from "@/app/components/ui/GradientHeading";
import { cn } from "@/app/lib/cn";

const STATUSES = [
  "all",
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES = {
  pending_payment: "bg-yellow-500/20 text-yellow-300",
  paid: "bg-green-500/20 text-green-300",
  processing: "bg-blue-500/20 text-blue-300",
  shipped: "bg-purple-500/20 text-purple-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const url = filter === "all" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="p-8 max-w-7xl">
      <GradientHeading size="lg" className="!leading-tight mb-1">
        Orders
      </GradientHeading>
      <p className="text-white/60 text-sm mb-6">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              filter === s
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/70 border-white/20 hover:border-white/50"
            )}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/60">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-white/20 rounded-2xl p-16 text-center">
          <p className="text-white/70">No orders found.</p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      href={`/admin/orders/${o._id}`}
                      className="text-white hover:underline"
                    >
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/80">{o.email}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-white/80">{o.items?.length}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider",
                        STATUS_STYLES[o.status] || "bg-white/10 text-white/70"
                      )}
                    >
                      {(o.status || "unknown").replace("_", " ")}
                    </span>
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

export default AdminOrdersPage;
