"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../Navbar/Navbar";
import CartDrawer from "../Cart/CartDrawer";

const ChromeGate = () => {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <Navbar />
      <CartDrawer />
    </>
  );
};

export default ChromeGate;
