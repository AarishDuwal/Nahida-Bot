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
  },
  {
    id: "is-dae-really-gay?",
    triggers: [
      "is dae really gay?",
      "is dae gay?",
      "dae gay?", 
      "are you sure dae is gay?",
    ],
    answer: "Yes, Dae is definitely gay.",
  },
  {
    id: "Is-artorias-really-lazy?",
    triggers: [
      "is artorias really lazy?",
      "is artorias lazy?",
      "artorias lazy?",
      "are you sure artorias is lazy?",
    ],
    answer: "Yes, Artorias is definitely lazy.",
  },
  {
    id: "does-artorias-misuse-ping-power?",
    triggers: [
      "does artorias misuse ping power?",
      "is artorias misusing his ping power?",
    ],
    answer: "Yes, Artorias is known to misuse his ping power.",
  },
  {
    id: "who-is-real-server-owner?",
    triggers: [
      "who is the real server owner?",  
    "who is the actual server owner?",
    "who is the true server owner?",
    "who is the legitimate server owner?",
    "who is the rightful server owner?",
    "who is the genuine server owner?",
    "who is the authentic server owner?",
    ],
    answer: "The real server owner is the lazy Artorias.",
  },
  {
    id: "why-dae-is-gay?",
    triggers: [
      "why is dae gay?",
      "why is dae so gay?",
      "why is dae the gayest of the gays?",
      "why is dae the super gay?",
    ],
    answer: "Dae is gay because that's just who She is!"
  },

];
