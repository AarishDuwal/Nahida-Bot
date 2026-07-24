// toramWiki.js
// Looks up real info from the Toram Online Fandom wiki so the AI can answer
// game questions grounded in actual wiki content instead of guessing/hallucinating.

const WIKI_API_BASE = "https://toram-online.fandom.com/api.php";

/**
 * Searches the Toram Online wiki for a query, then fetches a short plain-text
 * extract of the best-matching page.
 * @param {string} query - The user's question/message content
 * @returns {Promise<{title: string, extract: string} | null>} - null if nothing found
 */
async function searchToramWiki(query) {
  try {
    // Step 1: search for the best matching page title
    const searchUrl = `${WIKI_API_BASE}?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&format=json&srlimit=1`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const topResult = searchData?.query?.search?.[0];
    if (!topResult) return null;

    const title = topResult.title;

    // Step 2: fetch a plain-text extract/summary of that page
    const extractUrl = `${WIKI_API_BASE}?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(
      title
    )}&format=json`;

    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) return null;

    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    const extract = page?.extract;
    if (!extract) return null;

    // Cap length so we don't blow up the prompt with a huge page
    const trimmedExtract =
      extract.length > 1200 ? extract.slice(0, 1200) + "..." : extract;

    return { title, extract: trimmedExtract };
  } catch (err) {
    console.error("Toram wiki lookup failed:", err);
    return null;
  }
}

/** Quick check for whether a message is likely asking about Toram Online. */
function isToramRelated(message) {
  return /\btoram\b/i.test(message);
}

module.exports = { searchToramWiki, isToramRelated };
