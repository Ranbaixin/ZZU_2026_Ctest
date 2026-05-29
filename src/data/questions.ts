import { Question, questionsPart1 } from "./questions_part1";
import { questionsPart2 } from "./questions_part2";
import { questionsPart3 } from "./questions_part3";
import { questionsPart4 } from "./questions_part4";

export type { Question };

export const allQuestions: Question[] = [
  ...questionsPart1,
  ...questionsPart2,
  ...questionsPart3,
  ...questionsPart4
];

// Helper to get stats, chapters, etc.
export const categories = Array.from(new Set(allQuestions.map(q => q.cat)));
