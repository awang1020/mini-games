import type { Difficulty, Scoreboard, ScoreEntry } from '../types/sudoku';

export const SCOREBOARD_STORAGE_KEY = 'sudokuScoreboard';
export const PLAYER_NAME_STORAGE_KEY = 'sudokuPlayerName';
const LEGACY_HIGH_SCORES_KEY = 'sudokuHighScores';
export const SCOREBOARD_LIMIT = 10;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const createEmptyScoreboard = (): Scoreboard => ({
  easy: [],
  medium: [],
  hard: [],
});

const sortEntries = (entries: ScoreEntry[]): ScoreEntry[] =>
  [...entries].sort((a, b) => {
    if (a.time !== b.time) {
      return a.time - b.time;
    }
    if (a.errors !== b.errors) {
      return a.errors - b.errors;
    }
    if (a.hintsUsed !== b.hintsUsed) {
      return a.hintsUsed - b.hintsUsed;
    }

    return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
  });

const normaliseEntries = (value: unknown): ScoreEntry[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const result: ScoreEntry[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const { id, player, time, errors, hintsUsed, completedAt } = item;
    if (
      typeof id !== 'string' ||
      typeof player !== 'string' ||
      typeof time !== 'number' ||
      typeof errors !== 'number' ||
      typeof hintsUsed !== 'number' ||
      typeof completedAt !== 'string'
    ) {
      return null;
    }

    result.push({ id, player, time, errors, hintsUsed, completedAt });
  }

  return sortEntries(result);
};

const normaliseScoreboard = (value: unknown): Scoreboard | null => {
  if (!isRecord(value)) {
    return null;
  }

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const scoreboard = createEmptyScoreboard();

  for (const difficulty of difficulties) {
    const entries = normaliseEntries(value[difficulty]);
    if (!entries) {
      return null;
    }
    scoreboard[difficulty] = entries.slice(0, SCOREBOARD_LIMIT);
  }

  return scoreboard;
};

const convertLegacyScores = (value: unknown): Scoreboard | null => {
  if (!isRecord(value)) {
    return null;
  }

  const scoreboard = createEmptyScoreboard();
  const now = new Date().toISOString();
  (['easy', 'medium', 'hard'] as Difficulty[]).forEach((difficulty) => {
    const raw = value[difficulty];
    if (!Array.isArray(raw)) {
      return;
    }

    const entries: ScoreEntry[] = raw
      .filter((score): score is number => typeof score === 'number' && Number.isFinite(score))
      .map((time, index) => ({
        id: `${difficulty}-${index}-${time}`,
        player: 'Player',
        time,
        errors: 0,
        hintsUsed: 0,
        completedAt: now,
      }));

    scoreboard[difficulty] = sortEntries(entries).slice(0, SCOREBOARD_LIMIT);
  });

  return scoreboard;
};

export const loadScoreboard = (): Scoreboard => {
  if (typeof window === 'undefined') {
    return createEmptyScoreboard();
  }

  const stored = window.localStorage.getItem(SCOREBOARD_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const scoreboard = normaliseScoreboard(parsed);
      if (scoreboard) {
        return scoreboard;
      }
    } catch (error) {
      console.warn('[sudoku] Failed to parse scoreboard from localStorage', error);
    }
  }

  const legacy = window.localStorage.getItem(LEGACY_HIGH_SCORES_KEY);
  if (legacy) {
    try {
      const parsedLegacy = JSON.parse(legacy);
      const scoreboard = convertLegacyScores(parsedLegacy);
      if (scoreboard) {
        persistScoreboard(scoreboard);
        window.localStorage.removeItem(LEGACY_HIGH_SCORES_KEY);
        return scoreboard;
      }
    } catch (error) {
      console.warn('[sudoku] Failed to parse legacy high scores', error);
    }
  }

  return createEmptyScoreboard();
};

export const persistScoreboard = (scoreboard: Scoreboard) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(scoreboard));
};

export interface AddScoreResult {
  scoreboard: Scoreboard;
  entry: ScoreEntry | null;
  wasInserted: boolean;
}

const createEntryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const addScoreToScoreboard = (
  scoreboard: Scoreboard,
  difficulty: Difficulty,
  entryInput: Omit<ScoreEntry, 'id' | 'completedAt'> & { id?: string; completedAt?: string },
  limit = SCOREBOARD_LIMIT,
): AddScoreResult => {
  const id = entryInput.id ?? createEntryId();
  const completedAt = entryInput.completedAt ?? new Date().toISOString();
  const entry: ScoreEntry = { ...entryInput, id, completedAt };

  const existingEntries = scoreboard[difficulty] ?? [];
  const nextEntries = sortEntries([...existingEntries, entry]);
  const trimmed = nextEntries.slice(0, limit);
  const wasInserted = trimmed.some((item) => item.id === entry.id);

  const nextScoreboard: Scoreboard = {
    ...scoreboard,
    [difficulty]: trimmed,
  };

  return { scoreboard: nextScoreboard, entry: wasInserted ? entry : null, wasInserted };
};

export const clearScoreboard = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SCOREBOARD_STORAGE_KEY);
};
