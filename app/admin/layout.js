"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Admin/Sidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname() || "";
  // Login page renders chromeless
  if (pathname === "/admin/login") {
    return <div className="bg-black text-white min-h-screen">{children}</div>;
  }
  return (
    <div className="bg-black text-white min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
