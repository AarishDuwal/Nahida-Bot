// index.js
// Nahida — a personal Discord bot that responds to natural messages.
// No slash commands, no prefix required. Just talk to it / mention it / DM it.

require("dotenv").config();
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const config = require("./config");
const qaPairs = require("./responses");
const { generateReply } = require("./ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // required to read message text without a prefix
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

// Simple per-user cooldown to avoid spammy double replies
const lastReplyAt = new Map();

// --- Fuzzy matching helpers -------------------------------------------------

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance for typo tolerance
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

// Similarity score 0..1 based on normalized edit distance
function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// Checks whether the message contains something close enough to any trigger phrase.
// Uses whole-string similarity AND substring containment so short trigger phrases
// still match inside longer sentences (e.g. "yo nahi does riplik love luza fr").
function matchesTrigger(message, trigger) {
  const normMsg = normalize(message);
  const normTrig = normalize(trigger);

  if (normMsg.includes(normTrig)) return true;

  // Sliding window comparison for typo tolerance on multi-word phrases
  const msgWords = normMsg.split(" ");
  const trigWords = normTrig.split(" ");
  const windowSize = trigWords.length;

  for (let i = 0; i <= msgWords.length - windowSize; i++) {
    const window = msgWords.slice(i, i + windowSize).join(" ");
    if (similarity(window, normTrig) >= config.matchThreshold + 0.25) {
      return true;
    }
  }

  // Fallback: overall similarity for short messages
  if (similarity(normMsg, normTrig) >= config.matchThreshold + 0.25) {
    return true;
  }

  return false;
}

function findQAMatch(content) {
  for (const qa of qaPairs) {
    for (const trigger of qa.triggers) {
      if (matchesTrigger(content, trigger)) {
        return qa;
      }
    }
  }
  return null;
}

// --- General built-in smalltalk / utility answers ---------------------------

function tryBuiltInAnswer(content) {
  const msg = normalize(content);

  if (/\b(what ?s|what is) the time\b|\bwhat time is it\b|\btime rn\b|\bcurrent time\b/.test(msg)) {
    const now = new Date();
    return `Right now it's ${now.toLocaleTimeString()} (server time).`;
  }

  if (/\b(what ?s|what is) the date\b|\btodays date\b|\bwhat day is it\b/.test(msg)) {
    const now = new Date();
    return `Today is ${now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}.`;
  }

  if (/\bhow are you\b|\bhow r u\b|\bhows it going\b/.test(msg)) {
    return "I'm doing great, thanks for asking! How about you?";
  }

  if (/\bwho are you\b|\bwhat are you\b/.test(msg)) {
    return `I'm ${config.botName}, your friendly neighborhood bot 🤖`;
  }

  // Only treat as a plain greeting if the ENTIRE message is just a greeting —
  // otherwise "nahi what's a good weekend plan" would incorrectly match here
  // just because it starts with the wake word.
  const wakeWordPattern = config.wakeWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const greetingRegex = new RegExp(
    `^(hi|hello|hey|yo)?\\s*${wakeWordPattern}[,! ]*$|^(hi|hello|hey|yo)$`
  );
  if (greetingRegex.test(msg)) {
    return "✨ Hey there, friend! What's on your mind?";
  }

  return null;
}

// --- Message handling --------------------------------------------------------

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    const content = message.content?.trim();
    if (!content) return;

    // Only respond in DMs, when mentioned, or when the bot's name is said —
    // this avoids the bot replying to every single message in a busy server.
    const isDM = message.channel.type === 1; // DM channel
    const isMentioned = message.mentions.has(client.user);
    const wakeWordRegex = new RegExp(`\\b${config.wakeWord}\\b`, "i");
    const saysWakeWord = wakeWordRegex.test(content);

    if (!isDM && !isMentioned && !saysWakeWord) return;

    // Cooldown check
    const now = Date.now();
    const last = lastReplyAt.get(message.author.id) || 0;
    if (now - last < config.userCooldownMs) return;
    lastReplyAt.set(message.author.id, now);

    // Strip a leading mention like "@Nahida " from the content before matching
    const cleaned = content.replace(/<@!?\d+>/g, "").trim();

    // 1. Check custom Q&A pairs first
    const qaMatch = findQAMatch(cleaned);
    if (qaMatch) {
      if (qaMatch.id === "who-owner") {
        await message.reply(`My owner is **${config.ownerName}**. All credit (and blame) goes to them 😄`);
        return;
      }
      await message.reply(qaMatch.answer);
      return;
    }

    // 2. Check built-in smalltalk/utility answers
    const builtIn = tryBuiltInAnswer(cleaned);
    if (builtIn) {
      await message.reply(builtIn);
      return;
    }

    // 3. Fallback: ask the AI for a real, context-aware reply
    if (isDM || isMentioned || saysWakeWord) {
      try {
        await message.channel.sendTyping();
        const aiReply = await generateReply(message.channel.id, cleaned);
        await message.reply(aiReply);
      } catch (aiErr) {
        console.error("AI reply failed:", aiErr);
        await message.reply(
          "I glitched out trying to think of an answer 😅 try asking again in a sec."
        );
      }
    }
  } catch (err) {
    console.error("Error handling message:", err);
  }
});

client.once("ready", () => {
  console.log(`${config.botName} is online as ${client.user.tag}`);
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: config.statusText,
        type: ActivityType.Custom,
        state: config.statusText,
      },
    ],
  });
});

client.login(process.env.DISCORD_TOKEN);
