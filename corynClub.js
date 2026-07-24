// corynClub.js
// Looks up real Toram Online item/monster/map data from Coryn Club's
// official read-only JSON API: https://coryn.club/api/
// This gives accurate stats/data instead of letting the AI guess/hallucinate.

const CORYN_API_BASE = "https://coryn.club/api/v1";

// Common filler words to strip out of a question before using it as a search term
const STOPWORDS = [
  "toram", "online", "what", "whats", "what's", "is", "the", "are",
  "how", "much", "many", "does", "do", "can", "you", "tell", "me",
  "about", "of", "stats", "for", "a", "an", "in", "on", "give",
  "info", "information", "please", "nahi", "nahida",
];

function extractSearchTerm(message) {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.includes(w));
  return words.join(" ").trim();
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return data.data;
  } catch (err) {
    console.error(`Coryn Club API error (${url}):`, err);
    return null;
  }
}

/**
 * Searches items, monsters, and maps on Coryn Club for a given user message.
 * Returns a combined plain-text summary of the top matches, or null if nothing found.
 */
async function searchCorynClub(userMessage) {
  const term = extractSearchTerm(userMessage);
  if (!term) return null;

  const [items, monsters, maps] = await Promise.all([
    fetchJson(`${CORYN_API_BASE}/items.php?name=${encodeURIComponent(term)}&limit=3`),
    fetchJson(`${CORYN_API_BASE}/monsters.php?name=${encodeURIComponent(term)}&limit=3`),
    fetchJson(`${CORYN_API_BASE}/maps.php?name=${encodeURIComponent(term)}&limit=3`),
  ]);

  const sections = [];

  if (Array.isArray(items) && items.length > 0) {
    sections.push(
      "Items:\n" + items.map((i) => `- ${JSON.stringify(i)}`).join("\n")
    );
  }
  if (Array.isArray(monsters) && monsters.length > 0) {
    sections.push(
      "Monsters:\n" + monsters.map((m) => `- ${JSON.stringify(m)}`).join("\n")
    );
  }
  if (Array.isArray(maps) && maps.length > 0) {
    sections.push(
      "Maps:\n" + maps.map((m) => `- ${JSON.stringify(m)}`).join("\n")
    );
  }

  if (sections.length === 0) return null;

  // Cap total length so we don't blow up the prompt
  let combined = sections.join("\n\n");
  if (combined.length > 1500) combined = combined.slice(0, 1500) + "...";

  return combined;
}

module.exports = { searchCorynClub };
