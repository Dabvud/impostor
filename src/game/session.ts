import { drawImpostorCount, drawRound } from "./engine";
import { poolFor, poolKey } from "./modes";
import { maxImpostors, normalizeNames } from "./settings";
import type { Club, Footballer, Rng, Round, Settings } from "./types";

/** Schon gespielte Begriffe pro Topf (Schlüssel aus `poolKey`). */
export type UsedMap = Record<string, string[]>;

export function nextRound(
  s: Settings,
  players: Footballer[],
  clubs: Club[],
  used: UsedMap,
  rng: Rng,
): { round: Round; used: UsedMap } {
  const key = poolKey(s.mode, s.difficulty);
  const pool = poolFor(s.mode, s.difficulty, players, clubs);
  const names = normalizeNames(s.names);
  const impostorCount = s.secretImpostors ? drawImpostorCount(maxImpostors(names.length), rng) : s.impostorCount;
  const result = drawRound(names, impostorCount, pool, used[key] ?? [], rng, s.hintsEnabled);
  const round = { ...result.round, thinkSeconds: s.thinkSeconds, discussSeconds: s.discussSeconds };
  return { round, used: { ...used, [key]: result.used } };
}
