"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/app/lib/cn";
import {
  PackageIcon,
  SettingsIcon,
  LogOutIcon,
  CartIcon,
} from "../ui/Icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: SettingsIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/orders", label: "Orders", icon: CartIcon },
];

const Sidebar = () => {
  const pathname = usePathname() || "";
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <aside className="w-60 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-wide text-white">
            KARMIC
          </span>
        </Link>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
          Admin
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                active
                  ? "bg-white text-black"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon width={18} height={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="block px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-white/5 hover:text-white"
        >
          View store ↗
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white mt-1"
        >
          <LogOutIcon width={16} height={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
