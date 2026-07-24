module.exports = {
  botName: "Nahida",
  wakeWord: "nahi", // the word people say in chat to get the bot's attention
  statusText: "God of Wisdom",
  ownerName: process.env.OWNER_NAME || "Arvel",
  // How "close" a message needs to be to a known question to trigger (0-1, higher = stricter)
  matchThreshold: 0.6,
  // Cooldown (ms) so the bot doesn't spam-reply to rapid messages from same user
  userCooldownMs: 1500,
};
