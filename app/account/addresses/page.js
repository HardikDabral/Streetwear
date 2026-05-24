"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";
import { cn } from "@/app/lib/cn";
import { TrashIcon, PlusIcon } from "@/app/components/ui/Icons";

const inputCls =
  "w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/60";

const blank = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const Field = ({ label, className, ...props }) => (
  <label className={cn("block", className)}>
    <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
      {label}
    </span>
    <input {...props} className={inputCls} />
  </label>
);

const AddressForm = ({ initial, onSave, onCancel, busy }) => {
  const [form, setForm] = useState(initial || blank);
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  return (
    <div className="border border-white/10 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Full name *" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />
      <Field label="Phone *" type="tel" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
      <Field label="Address line 1 *" className="sm:col-span-2" value={form.line1} onChange={(e) => update({ line1: e.target.value })} />
      <Field label="Address line 2" className="sm:col-span-2" value={form.line2} onChange={(e) => update({ line2: e.target.value })} />
      <Field label="City *" value={form.city} onChange={(e) => update({ city: e.target.value })} />
      <Field label="State *" value={form.state} onChange={(e) => update({ state: e.target.value })} />
      <Field label="Pincode *" value={form.pincode} onChange={(e) => update({ pincode: e.target.value })} />
      <Field label="Country" value={form.country} onChange={(e) => update({ country: e.target.value })} />
      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} size="sm">Cancel</Button>
        <Button variant="gradient" onClick={() => onSave(form)} disabled={busy} size="sm">
          {busy ? "Saving…" : "Save address"}
        </Button>
      </div>
    </div>
  );
};

const AddressesPage = () => {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState(-1);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account/addresses");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/auth/addresses", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAddresses(d.addresses || []))
      .finally(() => setLoading(false));
  }, [user]);

  const save = async (next) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setAddresses(data.addresses);
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async (form) => {
    await save([...addresses, form]);
    setAdding(false);
  };

  const handleUpdate = async (idx, form) => {
    const next = addresses.map((a, i) => (i === idx ? form : a));
    await save(next);
    setEditingIdx(-1);
  };

  const handleDelete = async (idx) => {
    if (!confirm("Delete this address?")) return;
    await save(addresses.filter((_, i) => i !== idx));
  };

  if (authLoading || !user) return null;

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/account"
          className="text-xs text-white/50 hover:text-white inline-block mb-3"
        >
          ← Back to account
        </Link>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <GradientHeading size="lg">Address book</GradientHeading>
          {!adding && editingIdx === -1 && (
            <Button onClick={() => setAdding(true)} variant="gradient">
              <PlusIcon width={16} height={16} /> Add address
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {adding && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              New address
            </h3>
            <AddressForm
              onSave={handleAdd}
              onCancel={() => setAdding(false)}
              busy={busy}
            />
          </div>
        )}

        {loading ? (
          <p className="text-white/60">Loading…</p>
        ) : addresses.length === 0 && !adding ? (
          <div className="border border-dashed border-white/20 rounded-2xl py-16 text-center">
            <p className="text-white/70 mb-6">
              No addresses saved yet. Add one to speed up checkout next time.
            </p>
            <Button onClick={() => setAdding(true)} variant="gradient">
              Add your first address
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {addresses.map((a, i) => (
              <li key={i}>
                {editingIdx === i ? (
                  <AddressForm
                    initial={a}
                    onSave={(form) => handleUpdate(i, form)}
                    onCancel={() => setEditingIdx(-1)}
                    busy={busy}
                  />
                ) : (
                  <div className="border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                    <div className="flex-1 text-sm text-white/80 leading-relaxed">
                      <p className="font-semibold text-white">{a.fullName}</p>
                      <p>{a.line1}</p>
                      {a.line2 && <p>{a.line2}</p>}
                      <p>
                        {a.city}, {a.state} {a.pincode}
                      </p>
                      <p>{a.country}</p>
                      <p className="text-white/60 mt-1 text-xs">{a.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => setEditingIdx(i)}
                        className="text-xs text-white/70 hover:text-white underline-offset-4 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        className="text-red-400 hover:text-red-300"
                        aria-label="Delete"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddressesPage;
