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

const playerEntry = ({ name, hints }: Footballer): Entry => ({
  name,
  hints: [hints.nation, hints.position, hints.special].filter((h): h is string => Boolean(h)),
});

const clubEntry = ({ name, hints }: Club): Entry => ({ name, hints: [hints.region, hints.colors] });

const withTag = (players: Footballer[], tag: Tag) => players.filter((p) => p.tags.includes(tag));

/** Liefert den Topf an Begriffen für einen Modus. Die Schwierigkeit wirkt nur bei "alle". */
export function poolFor(mode: ModeId, difficulty: Tier, players: Footballer[], clubs: Club[]): Entry[] {
  switch (mode) {
    case "alle":
      return players.filter((p) => p.tier <= difficulty).map(playerEntry);
    case "bundesliga":
      return withTag(players, "bundesliga").map(playerEntry);
    case "cl-legenden":
      return withTag(players, "cl-legende").map(playerEntry);
    case "wm-legenden":
      return withTag(players, "wm-legende").map(playerEntry);
    case "fifa-icons":
      return withTag(players, "fifa-icon").map(playerEntry);
    case "vereine-de":
      return clubs.filter((c) => c.region === "de").map(clubEntry);
    case "vereine-int":
      return clubs.filter((c) => c.inAllClubs).map(clubEntry);
  }
}

/** Schlüssel, unter dem die schon gespielten Begriffe eines Topfs gespeichert werden. */
export function poolKey(mode: ModeId, difficulty: Tier): string {
  return mode === "alle" ? `alle-${difficulty}` : mode;
}
