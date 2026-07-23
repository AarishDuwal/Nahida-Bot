# Ei — Personal Discord Bot

A bot that replies to natural messages — no slash commands, no prefix. Just talk to it, mention it, or DM it.

## File structure
```
ei-bot/
├── index.js        # main bot logic (message listening, matching, replies)
├── config.js        # bot name, owner name, tuning values
├── responses.js      # your custom Q&A pairs
├── ai.js           # Groq API integration (free) for open-ended replies + per-channel memory
├── package.json
├── .env            # your bot token + API key (keep private, never commit)
└── .gitignore
```

## Setup

1. **Create the bot on Discord's Developer Portal**
   - Go to https://discord.com/developers/applications → New Application → name it "Ei"
   - Go to the "Bot" tab → Reset Token → copy it
   - Under "Privileged Gateway Intents", turn ON **Message Content Intent** (required, since the bot reads full message text without a prefix)

2. **Invite it to your server**
   - Go to OAuth2 → URL Generator
   - Scopes: `bot`
   - Permissions: `Send Messages`, `Read Message History`, `View Channels`
   - Open the generated URL and add the bot to your server

3. **Install dependencies**
   ```bash
   cd ei-bot
   npm install
   ```

4. **Add your token**
   Open `.env` and paste your real credentials:
   ```
   DISCORD_TOKEN=your_real_discord_token_here
   OWNER_NAME=Aarish
   GROQ_API_KEY=your_real_groq_api_key_here
   ```
   Get a free Groq API key at [console.groq.com](https://console.groq.com) → sign up (no credit card required) → **API Keys** → **Create API Key**.

5. **Run it**
   ```bash
   npm start
   ```
   You should see `Ei is online as Ei#1234` in the console.

## How it responds

- **In DMs**: replies to everything.
- **In server channels**: replies when you `@mention` it, or when your message contains the word "ei" (so you don't need a prefix — just say its name naturally, e.g. "ei what time is it").
- **Typo tolerance**: uses fuzzy string matching (Levenshtein distance) so small spelling mistakes in questions still match — e.g. "does riplek love luza" still triggers the right answer.
- **Reply priority**: custom Q&A (`responses.js`) → built-in smalltalk (time/date/etc.) → real AI-generated reply via Claude, in that order. The first one that matches wins.

## About the AI fallback (ai.js)

When nothing in `responses.js` or the built-in smalltalk matches, Ei calls the Groq API to generate a real, open-ended reply.

- **Free.** Groq has a genuine free tier — no credit card required, no trial expiration like some other providers.
- **Not permanent learning.** It doesn't train on your messages or get smarter over time. Each reply is generated fresh by the model based on the conversation so far.
- **Short-term memory only.** Ei keeps the last ~12 messages per channel in memory so replies feel like part of an ongoing conversation. This resets whenever the bot restarts or redeploys (e.g. after a `git push` to Railway) — nothing is saved permanently.
- **Model used:** `llama-3.3-70b-versatile` by default — good quality, plays well with Groq's free-tier limits. You can swap this for `llama-3.1-8b-instant` in `ai.js` if you want faster/cheaper-on-limits responses, or another supported Groq model.
- **Rate limits:** free tier has request/token limits per minute — check current limits at [console.groq.com](https://console.groq.com) if the bot starts erroring under heavy use.
- **Personality:** controlled by the `SYSTEM_PROMPT` in `ai.js` — edit that to change Ei's tone, add more personality quirks, or add ground rules.

## Editing custom answers

Open `responses.js` and add a new object to the array:
```js
{
  id: "my-new-question",
  triggers: ["some phrase", "a variant of it", "a common typo of it"],
  answer: "Your answer here",
}
```
Add a few different phrasings/typos to `triggers` so it matches more naturally.

## Notes on content

I left out one of the requested lines (the one using a racial slur about "riplik") — that's a hard line for me regardless of the joking context. Everything else you asked for is in there, including the Aarish and owner answers.

## Extending it further
Ideas if you want to go further:
- Add more smalltalk patterns in `tryBuiltInAnswer()` in `index.js`
- Hook up an actual AI model (like the Claude API) for open-ended replies instead of the generic fallback
- Add per-server config if you ever run it in more than one server
