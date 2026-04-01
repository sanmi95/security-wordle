exports.handler = async function (event, context) {
  try {
    const { blobs } = context;
    if (!blobs) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: process.env.DEFAULT_WORD || "CRYPT" }),
      };
    }
    const store = blobs.store("wordle");
    const word = await store.get("current_word");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: word ?? process.env.DEFAULT_WORD ?? "CRYPT" }),
    };
  } catch (err) {
    console.error("get-word error:", err);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: process.env.DEFAULT_WORD || "CRYPT" }),
    };
  }
};
