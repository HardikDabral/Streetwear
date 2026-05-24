import { cookies } from "next/headers";
import { signToken, verifyToken } from "./jwt";

export const CUSTOMER_COOKIE = "kv_session";
export const ADMIN_COOKIE = "kv_admin";

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const setSessionCookie = async (userId, role = "customer") => {
  const token = await signToken({ sub: String(userId), role });
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, token, { ...baseCookie, maxAge: 60 * 60 * 24 * 30 });
};

export const setAdminCookie = async () => {
  const token = await signToken({ role: "admin" }, "7d");
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { ...baseCookie, maxAge: 60 * 60 * 24 * 7 });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, "", { ...baseCookie, maxAge: 0 });
};

export const clearAdminCookie = async () => {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { ...baseCookie, maxAge: 0 });
};

export const getSessionPayload = async () => {
  const store = await cookies();
  return await verifyToken(store.get(CUSTOMER_COOKIE)?.value);
};

export const getAdminPayload = async () => {
  const store = await cookies();
  return await verifyToken(store.get(ADMIN_COOKIE)?.value);
};
