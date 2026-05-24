"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useCart } from "@/app/contexts/CartContext";
import { formatPrice } from "@/app/lib/format";
import { cld } from "@/app/lib/image";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";

const SHIPPING_FREE_AT = 2000;
const SHIPPING_FEE = 99;

const Field = ({ label, className, ...props }) => (
  <label className={`block ${className || ""}`}>
    <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
      {label}
    </span>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/60"
    />
  </label>
);

const CheckoutPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, clear: clearCart, hydrated } = useCart();

  const [details, setDetails] = useState({});
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [addressMode, setAddressMode] = useState("new"); // "saved" | "new"
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [saveAddress, setSaveAddress] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/checkout");
    }
  }, [authLoading, user, router]);

  // Choose default mode based on saved addresses
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      setAddressMode("saved");
      setAddress(user.addresses[0]);
      setSelectedIdx(0);
    } else if (user) {
      setAddress((a) => ({
        ...a,
        fullName: a.fullName || user.name || "",
        phone: a.phone || user.phone || "",
      }));
    }
  }, [user]);

  // When user picks a different saved address
  const pickSaved = (i) => {
    setSelectedIdx(i);
    setAddress(user.addresses[i]);
  };

  // Save new address to address book on successful order
  const persistAddressIfNew = async () => {
    if (addressMode !== "new" || !saveAddress) return;
    try {
      await fetch("/api/auth/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
    } catch (e) {
      // Non-blocking: order already succeeded
      console.warn("save address failed", e);
    }
  };

  // Hydrate product details for line items
  useEffect(() => {
    const missing = items.map((it) => it.productId).filter((id) => !details[id]);
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null))
      )
    ).then((res) => {
      const next = { ...details };
      res.forEach((r, i) => {
        if (r?.product) next[missing[i]] = r.product;
      });
      setDetails(next);
    });
  }, [items, details]);

  const subtotal = items.reduce((sum, it) => {
    const p = details[it.productId];
    return sum + (p?.price || 0) * it.quantity;
  }, 0);
  const shipping = subtotal >= SHIPPING_FREE_AT || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    setError("");

    const required = ["fullName", "phone", "line1", "city", "state", "pincode"];
    for (const k of required) {
      if (!address[k]?.trim()) {
        setError("Please complete all required fields.");
        return;
      }
    }
    if (!window.Razorpay) {
      setError("Razorpay didn't load. Please refresh and try again.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/checkout/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (!data.razorpay.keyId) {
        throw new Error(
          "Razorpay public key is missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env"
        );
      }

      const rzp = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        order_id: data.razorpay.orderId,
        name: "Karmic Vision",
        description: "Order payment",
        prefill: {
          name: data.customer.name,
          email: data.customer.email,
          contact: data.customer.phone,
        },
        theme: { color: "#22c55e" },
        handler: async (response) => {
          try {
            const v = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const vd = await v.json();
            if (!v.ok) throw new Error(vd.error || "Verification failed");
            await persistAddressIfNew();
            clearCart();
            router.push(`/account/orders/${vd.orderId}?placed=1`);
          } catch (e) {
            setError(e.message);
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description || "Payment failed");
        setBusy(false);
      });
      rzp.open();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  // Empty cart guard
  if (hydrated && items.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 text-center py-20">
          <GradientHeading size="md" className="mb-3">
            Nothing to check out
          </GradientHeading>
          <p className="text-white/60 mb-8">Add some items to your cart first.</p>
          <Button as={Link} href="/shop" variant="gradient" size="lg">
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-white/60">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <GradientHeading size="lg" className="mb-8">
            Checkout
          </GradientHeading>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Address form */}
            <div className="border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-lg font-extrabold uppercase tracking-wider">
                  Shipping address
                </h2>
                {user?.addresses?.length > 0 && (
                  <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setAddressMode("saved");
                        setAddress(user.addresses[selectedIdx] || user.addresses[0]);
                      }}
                      className={`px-3 py-1.5 rounded-full transition-colors ${addressMode === "saved" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                    >
                      Saved
                    </button>
                    <button
                      onClick={() => {
                        setAddressMode("new");
                        setAddress({
                          fullName: user.name || "",
                          phone: user.phone || "",
                          line1: "",
                          line2: "",
                          city: "",
                          state: "",
                          pincode: "",
                          country: "India",
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full transition-colors ${addressMode === "new" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                    >
                      New
                    </button>
                  </div>
                )}
              </div>

              {addressMode === "saved" && user?.addresses?.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((a, i) => (
                    <label
                      key={i}
                      className={`block border rounded-xl p-4 cursor-pointer transition-colors ${selectedIdx === i ? "border-white bg-white/5" : "border-white/15 hover:border-white/40"}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={selectedIdx === i}
                          onChange={() => pickSaved(i)}
                          className="mt-1 accent-white"
                        />
                        <div className="flex-1 text-sm text-white/80 leading-relaxed">
                          <p className="font-semibold text-white">{a.fullName}</p>
                          <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                          <p>{a.city}, {a.state} {a.pincode}</p>
                          <p className="text-white/60 text-xs mt-1">{a.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                  <p className="text-xs text-white/40 mt-2">
                    Manage saved addresses in your{" "}
                    <Link href="/account/addresses" className="underline hover:text-white">
                      address book
                    </Link>.
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full name *"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                />
                <Field
                  label="Phone *"
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                />
                <Field
                  label="Address line 1 *"
                  className="sm:col-span-2"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
                <Field
                  label="Address line 2"
                  className="sm:col-span-2"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                />
                <Field
                  label="City *"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <Field
                  label="State *"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
                <Field
                  label="Pincode *"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                />
                <Field
                  label="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                />
                <label className="sm:col-span-2 flex items-center gap-2 text-sm text-white/80 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="accent-white"
                  />
                  Save this address to my address book for next time
                </label>
              </div>
              )}
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 self-start border border-white/10 rounded-2xl p-6 h-fit">
              <h2 className="text-lg font-extrabold uppercase tracking-wider mb-4">
                Order summary
              </h2>
              <ul className="divide-y divide-white/10 mb-4 max-h-64 overflow-y-auto">
                {items.map((it) => {
                  const p = details[it.productId];
                  return (
                    <li key={`${it.productId}-${it.size}`} className="py-3 flex gap-3">
                      <div className="w-14 h-16 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                        {p?.imgSrc?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cld(p.imgSrc[0], { w: 150, crop: "fill" })} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{p?.name || "…"}</p>
                        <p className="text-xs text-white/50">
                          Qty {it.quantity}
                          {it.size ? ` · Size ${it.size}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {p ? formatPrice(p.price * it.quantity) : "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-white font-semibold">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-white text-xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <Button
                onClick={placeOrder}
                disabled={busy}
                variant="gradient"
                size="lg"
                className="w-full mt-5"
              >
                {busy ? "Processing…" : `Pay ${formatPrice(total)}`}
              </Button>
              <p className="text-[11px] text-white/40 text-center mt-3">
                Secured by Razorpay. By placing this order you agree to our terms.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
