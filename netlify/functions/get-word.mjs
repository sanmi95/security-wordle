import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore("wordle");
    const word = await store.get("current_word");
    return Response.json({ word: word ?? "CRYPT" });
  } catch (err) {
    console.error("get-word error:", err);
    return Response.json({ word: "CRYPT" });
  }
};

export const config = { path: "/api/get-word" };
