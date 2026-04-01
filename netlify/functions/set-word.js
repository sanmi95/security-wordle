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
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { word, password } = body;

  // Verify admin password
  const storedPassword = process.env.ADMIN_PASSWORD || "cyber2024";
  if (password !== storedPassword) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  // Validate word
  if (!word) return { statusCode: 400, body: JSON.stringify({ error: "Missing word" }) };
  const clean = word.trim().toUpperCase();
  if (!/^[A-Z]{5}$/.test(clean)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Word must be exactly 5 letters" }) };
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo  = process.env.GITHUB_REPO; // e.g. "sanmi95/security-wordle"

  try {
    // 1. Get current file SHA (required by GitHub API to update a file)
    const getRes = await fetch(
      `https://api.github.com/repos/${githubRepo}/contents/word.json`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "security-wordle-app",
        },
      }
    );

    if (!getRes.ok) {
      const err = await getRes.text();
      throw new Error(`GitHub GET failed: ${getRes.status} — ${err}`);
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;

    // 2. Update word.json with the new word
    const newContent = Buffer.from(JSON.stringify({ word: clean }) + "\n").toString("base64");

    const putRes = await fetch(
      `https://api.github.com/repos/${githubRepo}/contents/word.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "security-wordle-app",
        },
        body: JSON.stringify({
          message: `Update word of the day to ${clean}`,
          content: newContent,
          sha: sha,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.text();
      throw new Error(`GitHub PUT failed: ${putRes.status} — ${err}`);
    }

    // Netlify auto-deploys from GitHub push — no manual trigger needed
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        word: clean,
        message: "Word updated! Site will redeploy in ~20 seconds.",
      }),
    };

  } catch (err) {
    console.error("set-word error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
