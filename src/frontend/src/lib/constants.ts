export const SIGN_LANGUAGES = [
  { value: "ASL", label: "ASL — American Sign Language" },
  { value: "BSL", label: "BSL — British Sign Language" },
  { value: "ISL", label: "ISL — International Sign Language" },
  { value: "Auslan", label: "Auslan — Australian Sign Language" },
  { value: "JSL", label: "JSL — Japanese Sign Language" },
  { value: "CSL", label: "CSL — Chinese Sign Language" },
  { value: "LSF", label: "LSF — French Sign Language" },
  { value: "MSL", label: "MSL — Mexican Sign Language" },
  { value: "RSL", label: "RSL — Russian Sign Language" },
  { value: "PSL", label: "PSL — Pakistan Sign Language" },
];

export const SPOKEN_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
  { value: "Chinese (Simplified)", label: "Chinese (Simplified)" },
  { value: "Chinese (Traditional)", label: "Chinese (Traditional)" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Bengali", label: "Bengali" },
  { value: "Punjabi", label: "Punjabi" },
  { value: "Tamil", label: "Tamil" },
  { value: "Telugu", label: "Telugu" },
  { value: "Urdu", label: "Urdu" },
  { value: "Turkish", label: "Turkish" },
  { value: "Polish", label: "Polish" },
  { value: "Dutch", label: "Dutch" },
  { value: "Swedish", label: "Swedish" },
  { value: "Norwegian", label: "Norwegian" },
  { value: "Danish", label: "Danish" },
  { value: "Finnish", label: "Finnish" },
  { value: "Greek", label: "Greek" },
  { value: "Czech", label: "Czech" },
  { value: "Slovak", label: "Slovak" },
  { value: "Hungarian", label: "Hungarian" },
  { value: "Romanian", label: "Romanian" },
  { value: "Ukrainian", label: "Ukrainian" },
  { value: "Hebrew", label: "Hebrew" },
  { value: "Persian", label: "Persian (Farsi)" },
  { value: "Thai", label: "Thai" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Malay", label: "Malay" },
  { value: "Swahili", label: "Swahili" },
  { value: "Hausa", label: "Hausa" },
  { value: "Amharic", label: "Amharic" },
  { value: "Yoruba", label: "Yoruba" },
  { value: "Zulu", label: "Zulu" },
  { value: "Afrikaans", label: "Afrikaans" },
  { value: "Filipino", label: "Filipino / Tagalog" },
  { value: "Burmese", label: "Burmese" },
  { value: "Khmer", label: "Khmer" },
  { value: "Mongolian", label: "Mongolian" },
  { value: "Georgian", label: "Georgian" },
  { value: "Armenian", label: "Armenian" },
  { value: "Azerbaijani", label: "Azerbaijani" },
  { value: "Kazakh", label: "Kazakh" },
  { value: "Catalan", label: "Catalan" },
  { value: "Croatian", label: "Croatian" },
  { value: "Serbian", label: "Serbian" },
  { value: "Bulgarian", label: "Bulgarian" },
  { value: "Lithuanian", label: "Lithuanian" },
  { value: "Latvian", label: "Latvian" },
  { value: "Estonian", label: "Estonian" },
  { value: "Welsh", label: "Welsh" },
  { value: "Irish", label: "Irish" },
];

export const SIMULATED_TRANSLATIONS: Record<string, string[]> = {
  ASL: [
    "Hello, my name is Alex and I am very pleased to meet you today.",
    "Could you please help me find the nearest accessible entrance?",
    "I would like to order a coffee with oat milk, please.",
    "The weather is beautiful today. Would you like to take a walk with me?",
    "I understand sign language well and enjoy communicating this way.",
    "Thank you for being patient while I express myself in sign language.",
    "My family and I are visiting from out of town and need directions.",
  ],
  BSL: [
    "Good morning! Could you tell me where the nearest train station is?",
    "I have an appointment at 3 o'clock and I need assistance.",
    "This is a wonderful event. I am enjoying myself very much.",
    "Please speak a little slower — I am reading your lips.",
    "Can we arrange an interpreter for our next meeting?",
  ],
  default: [
    "Greetings and welcome. I am communicating through sign language.",
    "Please assist me — I use sign language as my primary communication.",
    "I would like to convey my gratitude for your understanding.",
    "Let's work together to ensure clear communication between us.",
  ],
};

export const SIGN_WORD_MAPPINGS: Record<string, string> = {
  hello: "HELLO",
  hi: "HI",
  goodbye: "GOODBYE",
  bye: "BYE",
  thank: "THANK-YOU",
  thanks: "THANK-YOU",
  please: "PLEASE",
  sorry: "SORRY",
  yes: "YES",
  no: "NO",
  help: "HELP",
  love: "LOVE",
  good: "GOOD",
  bad: "BAD",
  morning: "MORNING",
  evening: "EVENING",
  night: "NIGHT",
  today: "TODAY",
  tomorrow: "TOMORROW",
  yesterday: "YESTERDAY",
  i: "I",
  you: "YOU",
  we: "WE",
  they: "THEY",
  want: "WANT",
  need: "NEED",
  like: "LIKE",
  know: "KNOW",
  understand: "UNDERSTAND",
  water: "WATER",
  food: "FOOD",
  eat: "EAT",
  drink: "DRINK",
  go: "GO",
  come: "COME",
  stop: "STOP",
  wait: "WAIT",
  name: "NAME",
  where: "WHERE",
  what: "WHAT",
  when: "WHEN",
  how: "HOW",
  who: "WHO",
  why: "WHY",
};

export function sanitizeInput(input: string): string {
  // Strip HTML tags and script content
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

export function getSimulatedTranslation(signLanguage: string): string {
  const pool =
    SIMULATED_TRANSLATIONS[signLanguage] ?? SIMULATED_TRANSLATIONS.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getConfidenceLevel(): "high" | "medium" | "low" {
  const rand = Math.random();
  if (rand > 0.6) return "high";
  if (rand > 0.25) return "medium";
  return "low";
}

export function mapWordsToSigns(
  text: string,
): { word: string; sign: string }[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 30)
    .map((word) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, "");
      const sign = SIGN_WORD_MAPPINGS[clean] ?? clean.toUpperCase();
      return { word, sign };
    });
}
