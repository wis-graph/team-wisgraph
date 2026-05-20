export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const back = new URL("/", url);

  try {
    const ct = request.headers.get("content-type") || "";
    let data;
    if (ct.includes("application/json")) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    }

    const required = ["name", "org", "contact", "interest"];
    for (const k of required) {
      if (!data[k] || String(data[k]).trim() === "") {
        return json({ ok: false, error: `missing field: ${k}` }, 400);
      }
    }

    if (String(data.website || "").trim() !== "") {
      return json({ ok: true }, 200);
    }

    const ts = Date.now();
    const id = `${ts}-${crypto.randomUUID().slice(0, 8)}`;
    const entry = {
      id,
      ts,
      iso: new Date(ts).toISOString(),
      name: String(data.name || "").slice(0, 200),
      org: String(data.org || "").slice(0, 200),
      role: String(data.role || "").slice(0, 200),
      contact: String(data.contact || "").slice(0, 200),
      interest: String(data.interest || "").slice(0, 200),
      issue: String(data.issue || "").slice(0, 4000),
      timing: String(data.timing || "").slice(0, 200),
      ip: request.headers.get("cf-connecting-ip") || "",
      ua: request.headers.get("user-agent") || "",
      ref: request.headers.get("referer") || "",
    };

    await env.LEADS.put(`lead:${id}`, JSON.stringify(entry));

    if (env.TG_TOKEN && env.TG_CHAT) {
      const text =
        `🆕 Wisgraph 리드\n` +
        `이름: ${entry.name}\n` +
        `소속: ${entry.org}${entry.role ? ` / ${entry.role}` : ""}\n` +
        `연락처: ${entry.contact}\n` +
        `관심: ${entry.interest}\n` +
        `일정: ${entry.timing || "-"}\n` +
        `\n${entry.issue || "(고민 미입력)"}\n` +
        `\nid: ${id}`;
      await fetch(
        `https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id: env.TG_CHAT, text }),
        }
      ).catch(() => {});
    }

    const accept = request.headers.get("accept") || "";
    if (accept.includes("application/json")) {
      return json({ ok: true, id }, 200);
    }
    return Response.redirect(`${back.origin}/?sent=1&id=${encodeURIComponent(id)}#contact`, 303);
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) }, 500);
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
