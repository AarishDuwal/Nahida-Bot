// responses.js
// Custom Q&A pairs. Each entry has a list of "trigger phrases" (keywords/patterns
// that commonly appear in how someone might phrase the question, including typos)
// and an "answer". Matching is fuzzy, so small spelling mistakes still work.

module.exports = [
  {
    id: "riplik-luza",
    triggers: [
      "does riplik love luza",
      "riplik love luza",
      "riplik luza",
      "does riplek love luza",
      "does riplik love luzaa",
    ],
    answer: "Yes, riplik loves luza a lot 😄",
  },
  {
    id: "swapnil-gay",
    triggers: [
      "is swapnil gay",
      "swapnil gay",
      "is swapnill gay",
      "is swapnil gey",
    ],
    answer: "Yes, and that's totally fine — Swapnil, living his truth 🏳️‍🌈",
  },
  {
    id: "who-is-riplik",
    triggers: [
      "who is riplik",
      "whos riplik",
      "who is riplek",
      "who's riplik",
    ],
    answer: "Riplik is the legend who loves luza a lot. That's the whole lore.",
  },
  {
    id: "who-is-aarish",
    triggers: [
      "who is aarish",
      "whos aarish",
      "who's aarish",
      "who is arish",
      "who is aarrish",
      "what do you think about aarish",
      "aarish",
    ],
    answer:
      "Aarish is sharp, driven, and genuinely great to work with — someone who puts real thought and care into everything he builds. Big respect. 🙌",
  },
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
];
