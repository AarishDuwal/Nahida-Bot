# Ei — Personal Discord Bot

A bot that replies to natural messages — no slash commands, no prefix. Just talk to it, mention it, or DM it.

## File structure
```
ei-bot/
├── index.js        # main bot logic (message listening, matching, replies)
├── config.js        # bot name, owner name, tuning values
├── responses.js      # your custom Q&A pairs
├── package.json
├── .env            # your bot token (keep private, never commit)
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
   Open `.env` and paste your real token:
   ```
   DISCORD_TOKEN=your_real_token_here
   OWNER_NAME=Aarish
   ```

5. **Run it**
   ```bash
   npm start
   ```
   You should see `Ei is online as Ei#1234` in the console.

## How it responds

- **In DMs**: replies to everything.
- **In server channels**: replies when you `@mention` it, or when your message contains the word "ei" (so you don't need a prefix — just say its name naturally, e.g. "ei what time is it").
- **Typo tolerance**: uses fuzzy string matching (Levenshtein distance) so small spelling mistakes in questions still match — e.g. "does riplek love luza" still triggers the right answer.

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
