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

const WishlistContext = createContext(null);
const STORAGE_KEY = "kv_wishlist";

const readLocal = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocal = (ids) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export const WishlistProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [ids, setIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const syncTimer = useRef(null);
  const mergedForUser = useRef(null);

  useEffect(() => {
    setIds(readLocal());
    setHydrated(true);
  }, []);

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
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        const data = await res.json();
        const db = data.wishlist || [];
        const merged = [...new Set([...db, ...local].map(String))];
        setIds(merged);
        if (local.length > 0) writeLocal([]);
        if (merged.length !== db.length) {
          await fetch("/api/wishlist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wishlist: merged }),
          });
        }
        mergedForUser.current = user.id;
      } catch (e) {
        console.error("wishlist sync failed", e);
      }
    };
    sync();
  }, [user, authLoading, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      writeLocal(ids);
      return;
    }
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch("/api/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlist: ids }),
      }).catch((e) => console.error("wishlist push failed", e));
    }, 500);
    return () => syncTimer.current && clearTimeout(syncTimer.current);
  }, [ids, user, hydrated]);

  const has = useCallback((id) => ids.includes(String(id)), [ids]);

  const toggle = useCallback((productId) => {
    const id = String(productId);
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const remove = useCallback((productId) => {
    const id = String(productId);
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const count = useMemo(() => ids.length, [ids]);

  return (
    <WishlistContext.Provider value={{ ids, count, has, toggle, remove, clear }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};
