/**
 * Generates a vibrant array of unique pastel/light colors for the wheel.
 * Distributes hues evenly across the color spectrum, using lighter OKLCH values.
 * The number of colors scales dynamically with the item count.
 */
export function generateWheelColors(count: number): string[] {
  const colors: string[] = [];
  // Golden angle distribution for visually distinct adjacent colors
  const goldenAngle = 137.508;
  for (let i = 0; i < count; i++) {
    const hue = (i * goldenAngle) % 360;
    // Alternate lightness and chroma slightly for variety
    const lightness = 0.72 + (i % 3) * 0.04; // 0.72, 0.76, 0.80
    const chroma = 0.12 + (i % 2) * 0.04;    // 0.12, 0.16
    colors.push(`oklch(${lightness} ${chroma} ${hue.toFixed(1)})`);
  }
  return colors;
}

export interface QuestionItem {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // index 0-3
  meaning: string; // Turkish meaning for flashcard
}

export type GameMode = "wheel" | "flashcard";
export type WheelMode = "simple" | "questions";
export type AppView = "home" | "setup" | "game";

export interface SimpleWheelItem {
  id: string;
  word: string;
}

export const defaultSimpleWheelItems: SimpleWheelItem[] = [
  { id: "sw1", word: "Abandon" },
  { id: "sw2", word: "Benevolent" },
  { id: "sw3", word: "Conundrum" },
  { id: "sw4", word: "Diligent" },
  { id: "sw5", word: "Ephemeral" },
  { id: "sw6", word: "Fluctuate" },
  { id: "sw7", word: "Gregarious" },
  { id: "sw8", word: "Haphazard" },
];

export const defaultWheelQuestions: QuestionItem[] = [
  {
    id: "w1",
    question: "Abundant",
    options: ["Nadir", "Bol", "Kisa", "Uzun"],
    correctAnswer: 1,
    meaning: "Bol, bereketli",
  },
  {
    id: "w2",
    question: "Reluctant",
    options: ["Istekli", "Hizli", "Isteksiz", "Mutlu"],
    correctAnswer: 2,
    meaning: "Isteksiz, gonulsuz",
  },
  {
    id: "w3",
    question: "Ambiguous",
    options: ["Belirsiz", "Kesin", "Acik", "Kati"],
    correctAnswer: 0,
    meaning: "Belirsiz, muglak",
  },
  {
    id: "w4",
    question: "Inevitable",
    options: ["Mumkun", "Imkansiz", "Kacnilmaz", "Nadir"],
    correctAnswer: 2,
    meaning: "Kacinilmaz",
  },
  {
    id: "w5",
    question: "Profound",
    options: ["Yuzeysel", "Basit", "Hizli", "Derin"],
    correctAnswer: 3,
    meaning: "Derin, engin",
  },
  {
    id: "w6",
    question: "Contemporary",
    options: ["Eski", "Cagdas", "Gelecek", "Ilkel"],
    correctAnswer: 1,
    meaning: "Cagdas, guncel",
  },
  {
    id: "w7",
    question: "Subsequent",
    options: ["Onceki", "Sonraki", "Simdiki", "Eski"],
    correctAnswer: 1,
    meaning: "Sonraki, takip eden",
  },
  {
    id: "w8",
    question: "Deteriorate",
    options: ["Gelistirmek", "Korumak", "Kotulesme", "Iyilesme"],
    correctAnswer: 2,
    meaning: "Kotulesme, bozulma",
  },
];

export const defaultFlashcardQuestions: QuestionItem[] = [
  {
    id: "f1",
    question: "Comprehend",
    options: ["Anlamak", "Unutmak", "Yazmak", "Okumak"],
    correctAnswer: 0,
    meaning: "Anlamak, kavramak",
  },
  {
    id: "f2",
    question: "Enhance",
    options: ["Azaltmak", "Artirmak", "Degistirmek", "Silmek"],
    correctAnswer: 1,
    meaning: "Gelistirmek, artirmak",
  },
  {
    id: "f3",
    question: "Diminish",
    options: ["Buyumek", "Azaltmak", "Artmak", "Degismek"],
    correctAnswer: 1,
    meaning: "Azaltmak, kuculturmek",
  },
  {
    id: "f4",
    question: "Meticulous",
    options: ["Dikkatsiz", "Hizli", "Titiz", "Yavas"],
    correctAnswer: 2,
    meaning: "Titiz, ozenli",
  },
  {
    id: "f5",
    question: "Resilient",
    options: ["Kirilgan", "Dayanikli", "Zayif", "Kucuk"],
    correctAnswer: 1,
    meaning: "Dayanikli, esnek",
  },
  {
    id: "f6",
    question: "Obsolete",
    options: ["Yeni", "Guncel", "Modasi gecmis", "Populer"],
    correctAnswer: 2,
    meaning: "Modasi gecmis, kullanilmayan",
  },
  {
    id: "f7",
    question: "Pragmatic",
    options: ["Hayalci", "Pratik", "Teorik", "Soyut"],
    correctAnswer: 1,
    meaning: "Pragmatik, pratik",
  },
  {
    id: "f8",
    question: "Exacerbate",
    options: ["Iyilestirmek", "Kiddettirmek", "Hafifletmek", "Kolaylastirmak"],
    correctAnswer: 1,
    meaning: "Kiddettirmek, alevlendirmek",
  },
];
