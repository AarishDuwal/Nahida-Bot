// gifs.js
// Fetches a relevant GIF from Klipy's free API.
//
// NOTE: We use Klipy, not Tenor. Google is shutting Tenor's public GIF API
// down in 2026 (new keys already stopped being issued), so Tenor isn't a
// viable option to build on right now. Klipy was built by ex-Tenor staff
// specifically as a like-for-like replacement — Discord and WhatsApp are
// migrating to it too. A Test API key (free, no card, ~100 calls/hour) is
// plenty for a bot this size; a free Production key (unlimited calls) can
// be requested later from the Partner Panel once things are working.
//
// Get a key at: https://partner.klipy.com/api-keys
// Docs: https://docs.klipy.com/gifs-api/gifs-search-api

const KLIPY_API_KEY = process.env.KLIPY_API_KEY;
// Klipy asks for a "customer_id" per end user, mainly for their own
// analytics/content-filtering — a stable per-bot ID is fine here.
const KLIPY_CUSTOMER_ID = "nahida-bot";

/**
 * Search Klipy for a GIF matching the query and return a random pick
 * from the top results, so replies don't feel repetitive.
 * @param {string} query - e.g. "funny joke reaction"
 * @returns {Promise<string|null>} - direct GIF URL, or null if unavailable
 */
async function searchGif(query) {
  if (!KLIPY_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      q: query,
      customer_id: KLIPY_CUSTOMER_ID,
      per_page: "15",
    });

    const url = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/search?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[gifs.js] Klipy API error ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Klipy nests results under data.data (array of items)
    const results = data?.data?.data || data?.data || [];
    if (!Array.isArray(results) || results.length === 0) {
      console.error("[gifs.js] Klipy returned no results for:", query);
      return null;
    }

    const pick = results[Math.floor(Math.random() * results.length)];
    // NOTE: Klipy's documented field is "files" (plural), not "file" —
    // trying both in case the shape differs between test/production keys.
    const candidateUrl =
      pick?.files?.md?.gif?.url ||
      pick?.files?.sm?.gif?.url ||
      pick?.files?.hd?.gif?.url ||
      pick?.file?.md?.gif?.url ||
      pick?.file?.sm?.gif?.url ||
      pick?.file?.hd?.gif?.url ||
      null;

    // Sanity check: only return it if it actually looks like a real media
    // URL (gif/webp/mp4), not something malformed
    if (candidateUrl && /\.(gif|webp|mp4)(\?|$)/i.test(candidateUrl)) {
      return candidateUrl;
    }

    // Didn't get a usable URL — log the raw item shape so it can be fixed
    // precisely instead of guessing again. Check Railway logs for this.
    console.error(
      "[gifs.js] Unexpected Klipy item shape, raw pick:",
      JSON.stringify(pick).slice(0, 500)
    );
    return null;
  } catch (err) {
    console.error("[gifs.js] Klipy search failed:", err.message);
    return null;
  }
}

module.exports = { searchGif };
