import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { word, password } = body;

  // --- Password check ---
  // The admin password is stored as a Netlify Blob so it can be changed at runtime.
  // Fall back to the ADMIN_PASSWORD env variable (set in Netlify dashboard) if not yet stored.
  const store = getStore("wordle");
  const storedPassword =
    (await store.get("admin_password")) ?? process.env.ADMIN_PASSWORD ?? "cyber2024";

  if (password !== storedPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Handle password change ---
  if (body.newPassword) {
    if (typeof body.newPassword !== "string" || body.newPassword.length < 4) {
      return Response.json({ error: "Password too short" }, { status: 400 });
    }
    await store.set("admin_password", body.newPassword);
    return Response.json({ ok: true, action: "password_changed" });
  }

  // --- Handle word change ---
  if (!word || typeof word !== "string") {
    return Response.json({ error: "Missing word" }, { status: 400 });
  }

  const clean = word.trim().toUpperCase();
  if (!/^[A-Z]{5}$/.test(clean)) {
    return Response.json({ error: "Word must be exactly 5 letters" }, { status: 400 });
  }

  await store.set("current_word", clean);
  return Response.json({ ok: true, word: clean });
};

export const config = { path: "/api/set-word" };
