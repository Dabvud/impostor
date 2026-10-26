export type Tier = 1 | 2 | 3;
export type Tag = "bundesliga" | "cl-legende" | "wm-legende";
export type Footballer = { name: string; tier: Tier; tags: Tag[]; hint: string | null };
/** `inAllClubs`: erscheint im Modus „Alle Vereine“ (internationale Vereine immer, Bundesliga nur die relevanten). */
export type Club = { name: string; region: "de" | "int"; inAllClubs: boolean; hint: string | null };
export type Entry = { name: string; hint: string | null };
export type ModeId = "alle" | "bundesliga" | "cl-legenden" | "wm-legenden" | "vereine-de" | "vereine-int";
export type Settings = { names: string[]; impostorCount: number; mode: ModeId; difficulty: Tier };
export type Round = { word: Entry; impostors: string[]; revealOrder: string[]; starter: string };
/** Liefert Zufallszahlen in [0, 1). */
export type Rng = () => number;
