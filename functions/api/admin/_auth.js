// Shared auth helpers for /api/admin/*
// Token format: `${expUnixSec}.${hexSig}` where sig = HMAC-SHA256(ADMIN_SECRET, `v1:${exp}`)
// Cookie: HttpOnly, Secure, SameSite=Strict, Path=/, Max-Age=86400

export const COOKIE_NAME = "wg_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

export function readCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

export function buildSetCookie(name, value, { maxAge = COOKIE_MAX_AGE, clear = false } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
  ];
  if (clear) {
    parts.push("Max-Age=0");
  } else {
    parts.push(`Max-Age=${maxAge}`);
  }
  return parts.join("; ");
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sigBuf);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function issueToken(secret, ttlSeconds = COOKIE_MAX_AGE) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = await hmacSha256Hex(secret, `v1:${exp}`);
  return `${exp}.${sig}`;
}

export async function verifyToken(token, secret) {
  if (!token || typeof token !== "string") return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= 0) return false;
  if (Math.floor(Date.now() / 1000) >= exp) return false;
  const expected = await hmacSha256Hex(secret, `v1:${expStr}`);
  return timingSafeEqualHex(sig, expected);
}

export async function isAuthed(request, env) {
  if (!env.ADMIN_SECRET) return false;
  const token = readCookie(request, COOKIE_NAME);
  return await verifyToken(token, env.ADMIN_SECRET);
}
