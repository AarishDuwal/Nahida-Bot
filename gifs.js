// gifs.js
// Fetches a relevant GIF from Klipy's free API.
//
// NOTE: We use Klipy, not Tenor. Google is shutting Tenor's public GIF API
// down in 2026 (new keys already stopped being issued), so Tenor isn't a
// viable option to build on right now. Klipy was built by ex-Tenor staff
// specifically as a like-for-like replacement.
//
// Get a key at: https://partner.klipy.com/api-keys
// Docs: https://docs.klipy.com/gifs-api/gifs-search-api

const KLIPY_API_KEY = process.env.KLIPY_API_KEY;
// Klipy asks for a "customer_id" per end user, mainly for their own
// analytics/content-filtering — a stable per-bot ID is fine here.
const KLIPY_CUSTOMER_ID = "nahida-bot";

// Set KLIPY_DEBUG=true in env to log the raw API shape to Railway logs.
const DEBUG = process.env.KLIPY_DEBUG === "true";

// Field names that hold PLACEHOLDER art, not the real GIF. These are the
// low-res blurred/base64 previews meant to show while the real gif loads —
// if you embed one of these in Discord you get a grainy, dark, garbled
// image (the "broken horror gif" problem). Never pick a URL from these.
const PLACEHOLDER_KEY_PATTERN =
  /blur|placeholder|preview|thumb|poster|still|tiny|nano/i;

// Size tiers, worst to best. We deliberately skip the smallest tiers —
// they're thumbnail-grade and look pixelated/garbled when Discord embeds
// them at full size. Prefer md/hd.
const BAD_SIZE_KEYS = /^(xs|xxs|nano|tiny|micro)$/i;
const SIZE_PRIORITY = ["hd", "md", "lg", "sm"];

// Preferred media order: real animated gif first, then webp, then mp4.
const FORMAT_PRIORITY = ["gif", "webp", "mp4"];

/**
 * Walk a nested object and collect every plausible media URL, skipping
 * any branch whose key looks like a placeholder/preview asset.
 * This is shape-agnostic on purpose — it keeps working even if Klipy
 * changes their nesting between test and production keys.
 * @param {any} node
 * @param {string} keyPath - accumulated key names, for placeholder checks
 * @param {string[]} found - accumulator
 */
function collectMediaUrls(node, keyPath = "", found = []) {
  if (node == null) return found;

  if (typeof node === "string") {
    // Must be a real http(s) URL ending in a media extension.
    // Explicitly reject data: URIs — those are the base64 blur previews.
    if (
      /^https?:\/\//i.test(node) &&
      /\.(gif|webp|mp4)(\?|#|$)/i.test(node) &&
      !PLACEHOLDER_KEY_PATTERN.test(keyPath)
    ) {
      found.push({ url: node, keyPath });
    }
    return found;
  }

  if (Array.isArray(node)) {
    for (const item of node) collectMediaUrls(item, keyPath, found);
    return found;
  }

  if (typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      // Skip whole branches that are placeholder art or thumbnail-grade
      if (PLACEHOLDER_KEY_PATTERN.test(key)) continue;
      if (BAD_SIZE_KEYS.test(key)) continue;
      collectMediaUrls(value, `${keyPath}.${key}`, found);
    }
  }

  return found;
}

/**
 * Pick the best URL from the collected candidates. Ranks by size tier
 * first (hd > md > lg > sm), then by format (gif > webp > mp4), so we
 * always embed a full-quality animated file rather than a thumbnail.
 * @param {Array<{url: string, keyPath: string}>} candidates
 * @returns {string|null}
 */
function pickBestUrl(candidates) {
  if (!candidates.length) return null;

  const score = ({ url, keyPath }) => {
    const sizeIdx = SIZE_PRIORITY.findIndex((s) =>
      new RegExp(`\\.${s}(\\.|$)`, "i").test(keyPath)
    );
    const formatIdx = FORMAT_PRIORITY.findIndex((f) =>
      new RegExp(`\\.${f}(\\?|#|$)`, "i").test(url)
    );
    return (
      (sizeIdx === -1 ? SIZE_PRIORITY.length : sizeIdx) * 10 +
      (formatIdx === -1 ? FORMAT_PRIORITY.length : formatIdx)
    );
  };

  return [...candidates].sort((a, b) => score(a) - score(b))[0].url;
}

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
      per_page: "20",
    });

    const url = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/search?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[gifs.js] Klipy API error ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (DEBUG) {
      console.log(
        "[gifs.js] RAW RESPONSE:",
        JSON.stringify(data).slice(0, 2000)
      );
    }

    // Klipy nests results under data.data — but don't hard-depend on that
    const results = data?.data?.data || data?.data || data?.results || [];
    if (!Array.isArray(results) || results.length === 0) {
      console.error("[gifs.js] Klipy returned no results for:", query);
      return null;
    }

    // Shuffle so repeated queries don't always return the same gif, then
    // walk candidates until one yields a usable (non-placeholder) URL.
    const shuffled = [...results].sort(() => Math.random() - 0.5);

    for (const item of shuffled) {
      const candidates = collectMediaUrls(item);
      const best = pickBestUrl(candidates);
      if (best) return best;
    }

    // Nothing usable in ANY result — log one raw item so the real field
    // names can be read off the Railway logs and fixed precisely.
    console.error(
      "[gifs.js] No usable media URL found. Sample item:",
      JSON.stringify(shuffled[0]).slice(0, 1000)
    );
    return null;
  } catch (err) {
    console.error("[gifs.js] Klipy search failed:", err.message);
    return null;
  }
}

module.exports = { searchGif };
