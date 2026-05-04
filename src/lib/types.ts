// ── Game types ──────────────────────────────────────────────────────────────

export type GameType =
  | 'match-words'
  | 'sort-sentence'
  | 'true-false'
  | 'mcq'
  | 'flashcard'
  | 'fill-blank'
  | 'word-scramble'
  | 'categorize'

// One "entry" per game type
export interface MatchWordsEntry  { left: string; right: string }
export interface SortSentenceEntry { sentence: string }
export interface TrueFalseEntry   { question: string; answer: 'true' | 'false' }
export interface McqEntry         { question: string; options: string[]; answerIndex: number }
export interface FlashcardEntry   { front: string; back: string }
export interface FillBlankEntry   { sentence: string; answer: string }
export interface WordScrambleEntry { word: string }
export interface CategorizeEntry  { category: string; items: string[] }

export type GameEntry =
  | MatchWordsEntry | SortSentenceEntry | TrueFalseEntry | McqEntry
  | FlashcardEntry  | FillBlankEntry    | WordScrambleEntry | CategorizeEntry

export interface Game {
  id: string
  name: string
  type: GameType
  entries: GameEntry[]
  created: string
  share_token?: string
}

// ── Student sessions ─────────────────────────────────────────────────────────

export interface AnswerRecord {
  prompt: string
  studentAnswer: string
  correct: boolean
}

export interface GameSession {
  id: string
  studentName: string
  answers: AnswerRecord[]
  score: number
  total: number
  playedAt: string
}

// ── Wheel list ───────────────────────────────────────────────────────────────

export interface WheelList {
  id: string
  title: string
  names: string[]
}
