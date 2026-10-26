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

/** Kommen weniger Spieler eines Landes im Topf vor, verrät die Nation als Tipp zu viel. */
const MIN_SAME_NATION = 5;
/** Eine Region, die nur ein Verein im Topf hat, verrät ihn sofort. */
const MIN_SAME_REGION = 2;

const isText = (h: string | null): h is string => Boolean(h);

function countBy<T>(items: T[], key: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  return counts;
}

function playerEntries(players: Footballer[]): Entry[] {
  const nations = countBy(players, (p) => p.hints.nation);
  return players.map(({ name, hints }) => {
    const nation = (nations.get(hints.nation) ?? 0) >= MIN_SAME_NATION ? hints.nation : null;
    return { name, hints: [nation, hints.position, hints.special].filter(isText) };
  });
}

function clubEntries(clubs: Club[]): Entry[] {
  const regions = countBy(clubs, (c) => c.hints.region);
  return clubs.map(({ name, hints }) => {
    const region = (regions.get(hints.region) ?? 0) >= MIN_SAME_REGION ? hints.region : null;
    return { name, hints: [region, hints.colors].filter(isText) };
  });
}

const withTag = (players: Footballer[], tag: Tag) => players.filter((p) => p.tags.includes(tag));

/** Liefert den Topf an Begriffen für einen Modus. Die Schwierigkeit wirkt nur bei "alle". */
export function poolFor(mode: ModeId, difficulty: Tier, players: Footballer[], clubs: Club[]): Entry[] {
  switch (mode) {
    case "alle":
      return playerEntries(players.filter((p) => p.tier <= difficulty));
    case "bundesliga":
      return playerEntries(withTag(players, "bundesliga"));
    case "cl-legenden":
      return playerEntries(withTag(players, "cl-legende"));
    case "wm-legenden":
      return playerEntries(withTag(players, "wm-legende"));
    case "fifa-icons":
      return playerEntries(withTag(players, "fifa-icon"));
    case "vereine-de":
      return clubEntries(clubs.filter((c) => c.region === "de"));
    case "vereine-int":
      return clubEntries(clubs.filter((c) => c.inAllClubs));
  }
}

/** Schlüssel, unter dem die schon gespielten Begriffe eines Topfs gespeichert werden. */
export function poolKey(mode: ModeId, difficulty: Tier): string {
  return mode === "alle" ? `alle-${difficulty}` : mode;
}
