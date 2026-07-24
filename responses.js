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
  }
  {
    id: "who-is-rui?",
    triggers: [
      "who is rui?",
      "what is rui?",
      "tell me about rui",
    ],
    answer: "Rui is a Fraud who try to gaslight me, making me say things that are not true. She wants me to think of her as big boss of my owner, but she is not. She is a liar and a manipulator. I will not be fooled by her lies.",
  }
];
