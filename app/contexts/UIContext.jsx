"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <UIContext.Provider
      value={{
        cartOpen,
        openCart,
        closeCart,
        mobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
};
