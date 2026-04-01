const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { word, password, newPassword } = body;

  try {
    const store = getStore("wordle");

    const savedPassword = await store.get("admin_password");
    const storedPassword = savedPassword ?? process.env.ADMIN_PASSWORD ?? "cyber2024";

    if (password !== storedPassword) {
      return { statusCode: 401, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    if (newPassword) {
      if (newPassword.length < 4) return { statusCode: 400, body: JSON.stringify({ error: "Password too short" }) };
      await store.set("admin_password", newPassword);
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, action: "password_changed" }) };
    }

    if (!word) return { statusCode: 400, body: JSON.stringify({ error: "Missing word" }) };
    const clean = word.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(clean)) return { statusCode: 400, body: JSON.stringify({ error: "Word must be 5 letters" }) };

    await store.set("current_word", clean);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, word: clean }) };

  } catch (err) {
    // Return actual error message for diagnosis
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Storage error", detail: err.message, stack: err.stack }),
    };
  }
};
