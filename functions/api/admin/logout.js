import { COOKIE_NAME, buildSetCookie, jsonResponse } from "./_auth.js";

export async function onRequestPost() {
  return jsonResponse(
    { ok: true },
    200,
    { "set-cookie": buildSetCookie(COOKIE_NAME, "", { clear: true }) }
  );
}
