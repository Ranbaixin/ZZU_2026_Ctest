import { Question, allQuestions } from "../data/questions";

// Local storage keys
const STATE_KEY = "c_quiz_state_v1";
const HISTORY_KEY = "c_quiz_history_v1";

export interface PracticeState {
  answered: Record<number, string>; // questionId -> selectedOption ('A'|'B'|'C'|'D')
  correct: Record<number, boolean>; // questionId -> isCorrect
  bookmarked: Record<number, boolean>; // questionId -> boolean
  wrongList: number[]; // Array of wrong questionIds
}

export interface ExamHistoryRecord {
  id: string;
  timestamp: number;
  score: number; // raw score out of 30 or 100
  totalQuestions: number;
  correctAnswers: number;
  wrongIds: number[];
  durationSeconds: number;
}

// Default practice state
export const getInitialPracticeState = (): PracticeState => {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Backwards compatibility / sanity check
      if (parsed && typeof parsed === "object") {
        return {
          answered: parsed.answered || {},
          correct: parsed.correct || {},
          bookmarked: parsed.bookmarked || {},
          wrongList: parsed.wrongList || []
        };
      }
    }
  } catch (e) {
    console.error("Failed to load quiz state", e);
  }

  return {
    answered: {},
    correct: {},
    bookmarked: {},
    wrongList: []
  };
};

export const savePracticeState = (state: PracticeState) => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save quiz state", e);
  }
};

export const getExamHistory = (): ExamHistoryRecord[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load exam history", e);
  }
  return [];
};

export const saveExamHistory = (record: ExamHistoryRecord) => {
  try {
    const current = getExamHistory();
    const updated = [record, ...current].slice(0, 50); // Keep last 50 exams
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save exam history", e);
  }
};

export const clearAllData = () => {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem("c_quiz_shuffle_mode");
    localStorage.removeItem("c_quiz_shuffled_questions");
    try {
      window.location.reload();
    } catch (e) {
      console.warn("Reload not allowed in container iframe, continuing state reset", e);
    }
  } catch (e) {
    console.error("Failed to clear data", e);
  }
};

// Generate standard Mock Exam (30 questions)
// Pulls evenly from categories to ensure balanced testing block
export const generateMockExam = (): Question[] => {
  // We want exactly 30 questions.
  // Group questions by category, shuffling each pool, and pick proportional amount
  const categoriesMap: Record<string, Question[]> = {};
  allQuestions.forEach(q => {
    if (!categoriesMap[q.cat]) {
      categoriesMap[q.cat] = [];
    }
    categoriesMap[q.cat].push(q);
  });

  const keys = Object.keys(categoriesMap);
  const quizSet: Question[] = [];
  
  // Pick roughly 3-4 random questions from each category to form 30 total questions
  const perCat = Math.floor(30 / Math.max(1, keys.length));
  
  keys.forEach(cat => {
    const pool = [...categoriesMap[cat]].sort(() => Math.random() - 0.5);
    const count = Math.min(pool.length, perCat);
    quizSet.push(...pool.slice(0, count));
  });

  // If we still need more questions due to rounding, pad with random questions not already selected
  let remainingCount = 30 - quizSet.length;
  if (remainingCount > 0) {
    const selectedIds = new Set(quizSet.map(q => q.id));
    const padPool = allQuestions
      .filter(q => !selectedIds.has(q.id))
      .sort(() => Math.random() - 0.5);
    quizSet.push(...padPool.slice(0, remainingCount));
  }

  // Shuffle the final list
  return quizSet.sort(() => Math.random() - 0.5);
};
