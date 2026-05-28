import {
  COOKIE_NAME,
  buildSetCookie,
  issueToken,
  jsonResponse,
} from "./_auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SECRET) {
    return jsonResponse({ ok: false, error: "server not configured" }, 500);
  }

  let data;
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    }
  } catch {
    return jsonResponse({ ok: false, error: "invalid body" }, 400);
  }

  const password = String((data && data.password) || "");
  if (!password) {
    return jsonResponse({ ok: false, error: "missing password" }, 400);
  }

  // Constant-time compare on the raw bytes.
  const expected = String(env.ADMIN_PASSWORD);
  if (password.length !== expected.length) {
    return jsonResponse({ ok: false, error: "invalid password" }, 401);
  }
  let diff = 0;
  for (let i = 0; i < password.length; i++) {
    diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    return jsonResponse({ ok: false, error: "invalid password" }, 401);
  }

  const token = await issueToken(env.ADMIN_SECRET);
  return jsonResponse(
    { ok: true },
    200,
    { "set-cookie": buildSetCookie(COOKIE_NAME, token) }
  );
}

export async function onRequestDelete(ctx) {
  return logout(ctx);
}

export async function onRequestGet() {
  return jsonResponse({ ok: false, error: "method not allowed" }, 405);
}

function logout() {
  return jsonResponse(
    { ok: true },
    200,
    { "set-cookie": buildSetCookie(COOKIE_NAME, "", { clear: true }) }
  );
}
