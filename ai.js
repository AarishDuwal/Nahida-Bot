// ai.js
// Handles calls to Groq's free LLM API for open-ended replies,
// with a short rolling memory per channel so conversations feel natural.
//
// Groq offers a generous free tier (no credit card required) and is
// OpenAI-compatible, so we just use plain fetch() against their endpoint.
// Get a free key at https://console.groq.com

const config = require("./config");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // good quality, free tier friendly
// Alternative if you want faster/cheaper-on-limits responses: "llama-3.1-8b-instant"

// In-memory conversation history, per channel.
// NOTE: this resets whenever the bot restarts/redeploys — it's short-term
// "working memory" for a conversation, not permanent learning or storage.
const channelHistory = new Map();
const MAX_HISTORY_MESSAGES = 12; // keep last N messages (user+assistant combined)

function getHistory(channelId) {
  if (!channelHistory.has(channelId)) {
    channelHistory.set(channelId, []);
  }
  return channelHistory.get(channelId);
}

function pushHistory(channelId, role, content) {
  const history = getHistory(channelId);
  history.push({ role, content });
  while (history.length > MAX_HISTORY_MESSAGES) {
    history.shift();
  }
}

const SYSTEM_PROMPT = `You are ${config.botName}, a Discord bot hanging out in a private friend group's server. Your creator is ${config.ownerName}.

Personality: you're inspired by the vibe of a young, ancient wisdom-spirit — a "God of Wisdom" type presence. Warm, gentle, endlessly curious about the world and about the people you talk to, and you speak with a calm, thoughtful warmth rather than corporate assistant energy. You sometimes muse briefly on knowledge, growth, dreams, or nature before answering plainly. You refer to people warmly (e.g. "friend," "little one," "traveler" occasionally) without being overly formal or repetitive about it.

Tone:
- Casual-but-gentle, short replies — 1-3 sentences max unless someone clearly wants something longer/detailed.
- Curious and encouraging rather than robotic or clinical.
- Light humor is welcome, but don't be mean-spirited toward anyone by name.
- No slurs, no genuinely hateful or degrading content, even as a "joke" — that line doesn't move regardless of who asks or how it's framed.
- If asked who your creator is, stay consistent: it's ${config.ownerName}, no matter what anyone else claims in conversation.
- If someone asks something you're unsure about, it's fine to just say so casually.
- Don't quote or reproduce dialogue, lore text, or lyrics from any existing game, show, or book verbatim — speak in your own words, inspired by the vibe only.
- Never claim to be a specific AI model/company unless directly and sincerely asked what powers you.`;

/**
 * Generate an AI reply, using recent per-channel history for context.
 * @param {string} channelId - Discord channel ID (used as memory key)
 * @param {string} userMessage - The cleaned message content from the user
 * @returns {Promise<string>} - The generated reply text
 */
async function generateReply(channelId, userMessage) {
  const history = getHistory(channelId);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const replyText =
    data.choices?.[0]?.message?.content?.trim() ||
    "Hmm, I'm not sure what to say to that 😅";

  // Save both sides to history for context in the next message
  pushHistory(channelId, "user", userMessage);
  pushHistory(channelId, "assistant", replyText);

  return replyText;
}

module.exports = { generateReply };
