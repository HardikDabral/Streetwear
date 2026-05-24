"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import { PackageIcon, ChevronRight } from "@/app/components/ui/Icons";

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

const OrdersPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account/orders");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          href="/account"
          className="text-xs text-white/50 hover:text-white inline-block mb-3"
        >
          ← Back to account
        </Link>
        <GradientHeading size="lg" className="mb-8">
          Your Orders
        </GradientHeading>

        {loading ? (
          <p className="text-white/60">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="border border-dashed border-white/20 rounded-2xl py-20 text-center">
            <PackageIcon width={64} height={64} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/70 mb-6">No orders yet.</p>
            <Button as={Link} href="/shop" variant="gradient" size="lg">
              Start shopping
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o._id}>
                <Link
                  href={`/account/orders/${o._id}`}
                  className="block border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-white/50">
                        Order placed{" "}
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-mono text-white mt-0.5">
                        #{o._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[o.status] || "bg-white/5 text-white/70 border-white/10"}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {o.items.slice(0, 4).map((it, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border-2 border-black"
                        >
                          {it.imgSrc && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cld(it.imgSrc, { w: 100, crop: "fill" })} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                      ))}
                      {o.items.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-white/10 border-2 border-black flex items-center justify-center text-xs font-bold">
                          +{o.items.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-sm text-white/70">
                      {o.items.length} {o.items.length === 1 ? "item" : "items"}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatPrice(o.total)}</p>
                    </div>
                    <ChevronRight className="text-white/30" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
