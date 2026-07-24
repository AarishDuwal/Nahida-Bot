// responses.js
// Custom Q&A pairs. Each entry has a list of "trigger phrases" (keywords/patterns
// that commonly appear in how someone might phrase the question, including typos)
// and an "answer". Matching is fuzzy, so small spelling mistakes still work.

module.exports = [
  {
    id: "who-owner",
    triggers: [
      "who is your owner",
      "whos your owner",
      "who made you",
      "who created you",
      "who owns you",
      "your owner",
      "who is ur owner",
    ],
    answer: null, // handled dynamically in index.js using config.ownerName
  },
  {
    id: "who-is-rui?",
    triggers: [
      "who is rui?",
      "what is rui?",
      "tell me about rui",
    ],
    answer: "Rui is big boss but not the owner of this bot. Also not big boss of the owner.",
  },
  {
    id: "who-is-Artorias?",
    triggers: [
      "who is Artorias?",
      "what is Artorias?",
      "tell me about Artorias",
    ],
    answer: "Artorias is the Lazy owner of this guild who misuses his ping power.",
  },
  {
    id: "who-is-Dae?",
    triggers: [
      "who is Dae?",
      "what is Dae?",
      "tell me about Dae",
    ],
    answer: "Dae is a member of the guild who is gayest of the gays. The super gay.",
  }

];
