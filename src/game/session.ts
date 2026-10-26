import { drawRound } from "./engine";
import { poolFor, poolKey } from "./modes";
import { normalizeNames } from "./settings";
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
  const result = drawRound(normalizeNames(s.names), s.impostorCount, pool, used[key] ?? [], rng);
  return { round: result.round, used: { ...used, [key]: result.used } };
}
