import { isAuthed } from "../api/admin/_auth.js";

export async function onRequest({ request, env, next }) {
  if (await isAuthed(request, env)) {
    return next();
  }
  const url = new URL(request.url);
  const target = new URL("/admin/", url);
  target.searchParams.set("next", url.pathname + url.search);
  return Response.redirect(target.toString(), 302);
}
