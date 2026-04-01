const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
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

  try {
    const store = getStore("wordle");

    // Get stored password, fall back to env var
    const savedPassword = await store.get("admin_password");
    const storedPassword = savedPassword ?? process.env.ADMIN_PASSWORD ?? "cyber2024";

    // Verify password
    if (password !== storedPassword) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // Handle password change
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 4) {
        return { statusCode: 400, body: JSON.stringify({ error: "Password too short" }) };
      }
      await store.set("admin_password", newPassword);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, action: "password_changed" }),
      };
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
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, word: clean }),
    };

  } catch (err) {
    console.error("set-word error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Storage error: " + err.message }),
    };
  }
};
