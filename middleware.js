import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { ADMIN_COOKIE } from "@/app/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Protect admin pages and admin API routes (except login)
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login");

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const payload = await verifyToken(token);

  if (!payload || payload.role !== "admin") {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
