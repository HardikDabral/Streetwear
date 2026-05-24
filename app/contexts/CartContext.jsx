"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const STORAGE_KEY = "kv_cart";

const readLocal = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocal = (items) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const keyOf = (item) => `${item.productId}::${item.size || ""}`;

const mergeCarts = (a, b) => {
  const map = new Map();
  [...a, ...b].forEach((it) => {
    const k = keyOf(it);
    if (map.has(k)) {
      map.get(k).quantity += it.quantity;
    } else {
      map.set(k, { ...it });
    }
  });
  return Array.from(map.values());
};

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const syncTimer = useRef(null);
  const mergedForUser = useRef(null);

  // Initial hydration from localStorage
  useEffect(() => {
    setItems(readLocal());
    setHydrated(true);
  }, []);

  // When user logs in: merge local + DB, push to DB, clear local
  useEffect(() => {
    if (authLoading || !hydrated) return;
    if (!user) {
      mergedForUser.current = null;
      return;
    }
    if (mergedForUser.current === user.id) return;

    const sync = async () => {
      try {
        const local = readLocal();
        const res = await fetch("/api/cart", { cache: "no-store" });
        const data = await res.json();
        const dbCart = (data.cart || []).map((it) => ({
          productId: String(it.productId),
          quantity: it.quantity,
          size: it.size || null,
        }));
        const merged = mergeCarts(dbCart, local);
        setItems(merged);
        if (local.length > 0) writeLocal([]);
        if (merged.length !== dbCart.length || local.length > 0) {
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: merged }),
          });
        }
        mergedForUser.current = user.id;
      } catch (e) {
        console.error("cart sync failed", e);
      }
    };
    sync();
  }, [user, authLoading, hydrated]);

  // Persist changes: localStorage always, DB if logged in (debounced)
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      writeLocal(items);
      return;
    }
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: items }),
      }).catch((e) => console.error("cart push failed", e));
    }, 500);
    return () => syncTimer.current && clearTimeout(syncTimer.current);
  }, [items, user, hydrated]);

  const addItem = useCallback((product, opts = {}) => {
    const newItem = {
      productId: String(product._id || product.productId || product.id),
      quantity: opts.quantity || 1,
      size: opts.size || null,
    };
    setItems((prev) => {
      const k = keyOf(newItem);
      const idx = prev.findIndex((it) => keyOf(it) === k);
      if (idx === -1) return [...prev, newItem];
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: Math.min(99, next[idx].quantity + newItem.quantity) };
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId, size, quantity) => {
    setItems((prev) =>
      prev
        .map((it) =>
          keyOf(it) === keyOf({ productId, size }) ? { ...it, quantity } : it
        )
        .filter((it) => it.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId, size) => {
    setItems((prev) => prev.filter((it) => keyOf(it) !== keyOf({ productId, size })));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, count, addItem, updateQuantity, removeItem, clear, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
