// gifs.js
// Fetches a relevant GIF from Tenor's free API. Used so Nahida can reply
// with a fitting reaction GIF instead of (or alongside) plain text.
//
// Get a free Tenor API key at https://tenor.com/gifapi (Google account,
// generous free quota, no credit card).

const TENOR_API_KEY = process.env.TENOR_API_KEY;
const TENOR_SEARCH_URL = "https://tenor.googleapis.com/v2/search";

/**
 * Search Tenor for a GIF matching the query and return a random pick
 * from the top results (so replies don't feel repetitive).
 * @param {string} query - e.g. "funny joke", "dad joke reaction"
 * @returns {Promise<string|null>} - direct GIF URL, or null if unavailable
 */
async function searchGif(query) {
  if (!TENOR_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      q: query,
      key: TENOR_API_KEY,
      client_key: "nahida-bot",
      limit: "12",
      media_filter: "gif",
      contentfilter: "medium", // filters out NSFW/edgy results
    });

    const response = await fetch(`${TENOR_SEARCH_URL}?${params}`);
    if (!response.ok) {
      console.error(`[gifs.js] Tenor API error ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    const pick = results[Math.floor(Math.random() * results.length)];
    return (
      pick.media_formats?.gif?.url ||
      pick.media_formats?.tinygif?.url ||
      null
    );
  } catch (err) {
    console.error("[gifs.js] Tenor search failed:", err.message);
    return null;
  }
}

module.exports = { searchGif };
