"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import GradientHeading from "@/app/components/ui/GradientHeading";
import Button from "@/app/components/ui/Button";

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
      {label}
    </span>
    <input
      {...props}
      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
    />
  </label>
);

const AuthForm = ({ mode = "login" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/account";
  const { login, signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      router.push(nextUrl);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20 flex items-center">
      <div className="container mx-auto max-w-md px-4 sm:px-6">
        <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
          <GradientHeading size="md" className="mb-2 text-center">
            {isSignup ? "Create account" : "Welcome back"}
          </GradientHeading>
          <p className="text-center text-sm text-white/60 mb-8">
            {isSignup
              ? "Join Karmic Vision and unlock your wardrobe."
              : "Sign in to access your cart, wishlist, and orders."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Field
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={isSignup ? "At least 6 characters" : "••••••••"}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={busy}
            >
              {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-white font-semibold hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/signup" className="text-white font-semibold hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
