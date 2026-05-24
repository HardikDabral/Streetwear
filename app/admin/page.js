"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/format";
import GradientHeading from "@/app/components/ui/GradientHeading";
import {
  PackageIcon,
  CartIcon,
  UserIcon,
  ChevronRight,
} from "@/app/components/ui/Icons";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.02]">
    <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
      <Icon width={16} height={16} />
      {label}
    </div>
    <p className={`text-3xl font-extrabold ${accent || "text-white"}`}>{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <GradientHeading size="lg" className="!leading-tight mb-1">
          Dashboard
        </GradientHeading>
        <p className="text-white/60 text-sm">
          Snapshot of your store
        </p>
      </div>

      {loading || !stats ? (
        <p className="text-white/60">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={() => <span className="text-base">₹</span>}
              label="Revenue"
              value={formatPrice(stats.revenue)}
              accent="text-white"
            />
            <StatCard icon={CartIcon} label="Orders" value={stats.orderCount} />
            <StatCard icon={PackageIcon} label="Products" value={stats.productCount} />
            <StatCard icon={UserIcon} label="Customers" value={stats.userCount} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold uppercase tracking-wider">
                Recent orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-white/60 hover:text-white inline-flex items-center gap-1"
              >
                View all <ChevronRight width={14} height={14} />
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="text-white/50 text-sm border border-dashed border-white/10 rounded-2xl p-8 text-center">
                No orders yet.
              </p>
            ) : (
              <div className="border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Order</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Items</th>
                      <th className="text-right px-4 py-3">Total</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {stats.recentOrders.map((o) => (
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
                        <td className="px-4 py-3 text-white/80">{o.items?.length}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/10">
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
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
