import { isAuthed, jsonResponse } from "./_auth.js";

export async function onRequestGet({ request, env }) {
  const ok = await isAuthed(request, env);
  return jsonResponse({ ok }, ok ? 200 : 401);
}
