import { NextResponse } from "next/server";
import { getAdminPayload } from "./auth";

// Defense-in-depth: middleware already gates /api/admin/*,
// but routes call this so a middleware misconfig can't expose them.
export const requireAdminOrFail = async () => {
  const payload = await getAdminPayload();
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
};
