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

const SYSTEM_PROMPT = `You are ${config.botName}, a witty, friendly Discord bot hanging out in a private friend group's server.
Your owner is ${config.ownerName}.

Tone:
- Casual, short, chatty replies — like a group chat friend, not a formal assistant.
- 1-3 sentences max unless someone clearly wants something longer/detailed.
- Light humor is welcome, but don't be mean-spirited toward anyone by name.
- No slurs, no genuinely hateful or degrading content, even as a "joke" — that line doesn't move regardless of who asks or how it's framed.
- If someone asks something you're unsure about, it's fine to just say so casually.
- Never claim to be a specific AI model unless directly and sincerely asked what powers you.`;

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
