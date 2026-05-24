"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useCart } from "@/app/contexts/CartContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import { cn } from "@/app/lib/cn";
import {
  UserIcon,
  PackageIcon,
  HeartIcon,
  CartIcon,
  LogOutIcon,
  ChevronRight,
} from "@/app/components/ui/Icons";

const Stat = ({ icon: Icon, label, value, href }) => (
  <Link
    href={href}
    className="block border border-white/10 rounded-xl p-5 hover:bg-white/5 transition-colors"
  >
    <div className="flex items-center gap-3 mb-2 text-white/60">
      <Icon width={18} height={18} />
      <span className="text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <p className="text-3xl font-extrabold">{value}</p>
  </Link>
);

const inputCls =
  "w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/60";

const AccountPage = () => {
  const router = useRouter();
  const { user, loading, logout, updateProfile } = useAuth();
  const { items } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedHint, setSavedHint] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-white/60">Loading…</p>
        </div>
      </div>
    );
  }

  const cartCount = items.reduce((s, it) => s + it.quantity, 0);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateProfile({ name, phone });
      setEditing(false);
      setSavedHint("Saved.");
      setTimeout(() => setSavedHint(""), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setPhone(user.phone || "");
    setEditing(false);
    setError("");
  };

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
              Welcome back
            </p>
            <GradientHeading size="lg" className="!leading-tight">
              {user.name || user.email.split("@")[0]}
            </GradientHeading>
            <p className="text-white/60 text-sm mt-2">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            <LogOutIcon width={16} height={16} /> Sign out
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Stat icon={CartIcon} label="In cart" value={cartCount} href="/cart" />
          <Stat icon={HeartIcon} label="Wishlist" value={wishlistCount} href="/wishlist" />
          <Stat icon={PackageIcon} label="Orders" value={user.addresses?.length != null ? "→" : "—"} href="/account/orders" />
        </div>

        {/* Profile */}
        <div className="border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold uppercase tracking-wider flex items-center gap-2">
              <UserIcon width={18} height={18} /> Profile
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-white/70 hover:text-white underline-offset-4 hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Name
                </label>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Phone
                </label>
                <input
                  className={inputCls}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 …"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Email
                </label>
                <input
                  className={cn(inputCls, "opacity-60 cursor-not-allowed")}
                  value={user.email}
                  disabled
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Email cannot be changed.
                </p>
              </div>
              <div className="sm:col-span-2 flex items-center justify-end gap-3">
                {error && (
                  <span className="text-xs text-red-400 mr-auto">{error}</span>
                )}
                <Button onClick={handleSave} variant="gradient" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-white/50 mb-1">Name</dt>
                <dd className="text-white font-semibold">
                  {user.name || <span className="text-white/40">Not set</span>}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 mb-1">Email</dt>
                <dd className="text-white font-semibold">{user.email}</dd>
              </div>
              <div>
                <dt className="text-white/50 mb-1">Phone</dt>
                <dd className="text-white font-semibold">
                  {user.phone || <span className="text-white/40">Not set</span>}
                </dd>
              </div>
              <div>
                <dt className="text-white/50 mb-1">Saved addresses</dt>
                <dd className="text-white font-semibold">
                  {user.addresses?.length || 0}
                </dd>
              </div>
            </dl>
          )}
          {savedHint && (
            <p className="text-xs text-green-400 mt-3">{savedHint}</p>
          )}
        </div>

        {/* Addresses link card */}
        <Link
          href="/account/addresses"
          className="block border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-wider mb-1">
                Address book
              </h2>
              <p className="text-sm text-white/60">
                {user.addresses?.length || 0} saved{" "}
                {(user.addresses?.length || 0) === 1 ? "address" : "addresses"} — used to speed up checkout.
              </p>
            </div>
            <ChevronRight className="text-white/40" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;
