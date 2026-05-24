import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (need 16+ chars)");
  }
  return new TextEncoder().encode(s);
};

export const signToken = async (payload, expiresIn = "30d") => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
};

export const verifyToken = async (token) => {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
};
