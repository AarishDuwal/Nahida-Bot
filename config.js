module.exports = {
  botName: "Nahida",
  wakeWord: "nahi", // the word people say in chat to get the bot's attention
  statusText: "God of Wisdom",
  ownerName: process.env.OWNER_NAME || "Arvel",
  // The REAL owner's Discord user ID. Used to verify creator claims —
  // only messages actually sent by this Discord account are trusted as
  // coming from the owner; anyone else typing "I'm your creator" is not.
  ownerDiscordId: process.env.OWNER_DISCORD_ID || "",
  // If true, always try Toram Online lookups (Coryn Club + wiki) on every
  // AI fallback message, since this bot lives in a Toram-focused server —
  // no need to require the word "toram" to be typed every time.
  assumeToramContext: true,
  // How "close" a message needs to be to a known question to trigger (0-1, higher = stricter)
  matchThreshold: 0.6,
  // Cooldown (ms) so the bot doesn't spam-reply to rapid messages from same user
  userCooldownMs: 1500,
};