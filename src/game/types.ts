export type Tier = 1 | 2 | 3;
export type Tag = "bundesliga" | "cl-legende" | "wm-legende" | "fifa-icon";
/** Merkmale, aus denen der Tipp für den Impostor gezogen wird. */
export type PlayerHints = { nation: string; position: string; special: string | null };
export type ClubHints = {
  region: string;
  color: string;
  league: string;
  character: string;
  success: string;
  crest: string;
};
export type Footballer = { name: string; tier: Tier; tags: Tag[]; hints: PlayerHints };
/** `inAllClubs`: erscheint im Modus „Alle Vereine“ (internationale Vereine immer, Bundesliga nur die relevanten). */
export type Club = { name: string; region: "de" | "int"; inAllClubs: boolean; hints: ClubHints };
export type Entry = { name: string; hints: string[] };
export type ModeId =
  | "alle"
  | "bundesliga"
  | "cl-legenden"
  | "wm-legenden"
  | "fifa-icons"
  | "vereine-de"
  | "vereine-int";
export type Settings = {
  names: string[];
  impostorCount: number;
  mode: ModeId;
  difficulty: Tier;
  hintsEnabled: boolean;
  /** Anzahl der Impostor wird jede Runde geheim ausgelost (0 bis Maximum). */
  secretImpostors: boolean;
  /** Überlegzeit pro Spieler in der Hinweisrunde; null = keine Hinweisrunde. */
  thinkSeconds: number | null;
  /** Diskussionszeit; null = kein Diskussions-Timer. */
  discussSeconds: number | null;
};
export type Round = {
  word: Entry;
  hint: string | null;
  impostors: string[];
  revealOrder: string[];
  starter: string;
  /** Hinweisrunde: ab dem Starter in der Reihenfolge der eingetragenen Namen. */
  speakingOrder: string[];
  thinkSeconds: number | null;
  discussSeconds: number | null;
};
/** Liefert Zufallszahlen in [0, 1). */
export type Rng = () => number;
