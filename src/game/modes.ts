import type { Club, Entry, Footballer, ModeId, Tag, Tier } from "./types";

export const MODES: { id: ModeId; label: string; hasDifficulty: boolean }[] = [
  { id: "alle", label: "⚽ Alle Fußballer", hasDifficulty: true },
  { id: "bundesliga", label: "🇩🇪 Bundesliga", hasDifficulty: false },
  { id: "cl-legenden", label: "🏆 CL-Legenden", hasDifficulty: false },
  { id: "wm-legenden", label: "🌍 WM-Legenden", hasDifficulty: false },
  { id: "fifa-icons", label: "🎮 FIFA Icons", hasDifficulty: false },
  { id: "vereine-de", label: "🏟️ Vereine Bundesliga", hasDifficulty: false },
  { id: "vereine-int", label: "🌐 Alle Vereine", hasDifficulty: false },
];

const toEntry = ({ name, hint }: { name: string; hint: string | null }): Entry => ({ name, hint });

const withTag = (players: Footballer[], tag: Tag) => players.filter((p) => p.tags.includes(tag));

/** Liefert den Topf an Begriffen für einen Modus. Die Schwierigkeit wirkt nur bei "alle". */
export function poolFor(mode: ModeId, difficulty: Tier, players: Footballer[], clubs: Club[]): Entry[] {
  switch (mode) {
    case "alle":
      return players.filter((p) => p.tier <= difficulty).map(toEntry);
    case "bundesliga":
      return withTag(players, "bundesliga").map(toEntry);
    case "cl-legenden":
      return withTag(players, "cl-legende").map(toEntry);
    case "wm-legenden":
      return withTag(players, "wm-legende").map(toEntry);
    case "fifa-icons":
      return withTag(players, "fifa-icon").map(toEntry);
    case "vereine-de":
      return clubs.filter((c) => c.region === "de").map(toEntry);
    case "vereine-int":
      return clubs.filter((c) => c.inAllClubs).map(toEntry);
  }
}

/** Schlüssel, unter dem die schon gespielten Begriffe eines Topfs gespeichert werden. */
export function poolKey(mode: ModeId, difficulty: Tier): string {
  return mode === "alle" ? `alle-${difficulty}` : mode;
}
