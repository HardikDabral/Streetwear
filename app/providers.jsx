"use client";

import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <WishlistProvider>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export default Providers;
