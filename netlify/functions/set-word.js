exports.handler = async function (event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { word, password, newPassword } = body;

  // Get stored admin password (fall back to env var)
  const { blobs } = context;
  let storedPassword = process.env.ADMIN_PASSWORD || "cyber2024";

  if (blobs) {
    const store = blobs.store("wordle");
    const saved = await store.get("admin_password");
    if (saved) storedPassword = saved;

    // Verify password
    if (password !== storedPassword) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    // Handle password change
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 4) {
        return { statusCode: 400, body: JSON.stringify({ error: "Password too short" }) };
      }
      await store.set("admin_password", newPassword);
      return { statusCode: 200, body: JSON.stringify({ ok: true, action: "password_changed" }) };
    }

    // Handle word change
    if (!word || typeof word !== "string") {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing word" }) };
    }
    const clean = word.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(clean)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Word must be exactly 5 letters" }) };
    }
    await store.set("current_word", clean);
    return { statusCode: 200, body: JSON.stringify({ ok: true, word: clean }) };

  } else {
    // Blobs not available — verify password against env only
    if (password !== storedPassword) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    return { statusCode: 503, body: JSON.stringify({ error: "Storage not available" }) };
  }
};
