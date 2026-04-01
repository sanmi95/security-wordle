const { getStore } = require("@netlify/blobs");

exports.handler = async function () {
  try {
    const store = getStore("wordle");
    const word = await store.get("current_word");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: word ?? "CRYPT" }),
    };
  } catch (err) {
    // Return the actual error so we can diagnose
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: "CRYPT", debug_error: err.message }),
    };
  }
};
