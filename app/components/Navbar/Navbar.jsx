"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/app/lib/cn";
import { useAuth } from "@/app/contexts/AuthContext";
import { useCart } from "@/app/contexts/CartContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useUI } from "@/app/contexts/UIContext";
import IconButton from "../ui/IconButton";
import {
  SearchIcon,
  HeartIcon,
  CartIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  ChevronDown,
  LogOutIcon,
  PackageIcon,
} from "../ui/Icons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=Hoodie", label: "Hoodies" },
  { href: "/about", label: "About" },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openCart, mobileMenuOpen, openMobileMenu, closeMobileMenu } = useUI();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, closeMobileMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearch("");
    }
  };

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled || !isHome
            ? "bg-black/85 backdrop-blur-md border-b border-white/10"
            : "bg-gradient-to-b from-black/60 to-transparent"
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: mobile menu + logo */}
            <div className="flex items-center gap-2">
              <IconButton
                className="md:hidden"
                onClick={openMobileMenu}
                aria-label="Open menu"
              >
                <MenuIcon />
              </IconButton>
              <Link href="/" className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-white">
                  KARMIC
                </span>
              </Link>
            </div>

            {/* Center: desktop nav (absolutely positioned so links stay truly centered regardless of logo/icon widths) */}
            <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-white hover:text-white/70 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-1">
              <IconButton
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <SearchIcon />
              </IconButton>

              <Link href="/wishlist">
                <IconButton badge={wishlistCount} aria-label="Wishlist">
                  <HeartIcon />
                </IconButton>
              </Link>

              <IconButton
                onClick={openCart}
                badge={cartCount}
                aria-label="Open cart"
              >
                <CartIcon />
              </IconButton>

              {/* User menu (desktop) */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1 ml-1 px-3 h-10 rounded-full text-white hover:bg-white/10 transition-colors text-sm font-semibold"
                  aria-label="Account menu"
                >
                  <UserIcon width={18} height={18} />
                  <span className="max-w-[80px] truncate">
                    {user ? (user.name || user.email.split("@")[0]) : "Sign in"}
                  </span>
                  <ChevronDown width={14} height={14} />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111] border border-white/10 shadow-2xl py-2 z-40 animate-fade-in">
                      {user ? (
                        <>
                          <div className="px-4 py-2 border-b border-white/10">
                            <p className="text-xs text-white/50">Signed in as</p>
                            <p className="text-sm text-white truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/account"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                          >
                            <UserIcon width={16} height={16} /> My Account
                          </Link>
                          <Link
                            href="/account/orders"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                          >
                            <PackageIcon width={16} height={16} /> Orders
                          </Link>
                          <button
                            onClick={async () => {
                              await logout();
                              setUserMenuOpen(false);
                              router.push("/");
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                          >
                            <LogOutIcon width={16} height={16} /> Sign out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/signup"
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5"
                          >
                            Create account
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search slide-down */}
          {searchOpen && (
            <form
              onSubmit={handleSearch}
              className="pb-4 animate-slide-up"
            >
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-3 border border-white/20 focus-within:border-white/50 transition-colors">
                <SearchIcon className="text-white/60" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hoodies, tees, accessories…"
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-white/60 hover:text-white"
                  aria-label="Close search"
                >
                  <CloseIcon width={18} height={18} />
                </button>
              </div>
            </form>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-xs bg-black border-r border-white/10 animate-slide-in-right p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-extrabold text-white">
                KARMIC
              </span>
              <IconButton onClick={closeMobileMenu} aria-label="Close menu">
                <CloseIcon />
              </IconButton>
            </div>
            <nav className="flex flex-col gap-1 mb-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 rounded-lg text-base font-semibold text-white/90 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 pt-6 space-y-1">
              {user ? (
                <>
                  <p className="px-4 text-xs text-white/50 mb-2">
                    {user.email}
                  </p>
                  <Link href="/account" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg">My Account</Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg">Orders</Link>
                  <Link href="/wishlist" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg">Wishlist</Link>
                  <button
                    onClick={async () => { await logout(); router.push("/"); }}
                    className="block w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg">Sign in</Link>
                  <Link href="/signup" className="block px-4 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg">Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
