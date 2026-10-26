import type { Entry, Rng, Round } from "./types";

function shuffle<T>(items: T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const pick = <T>(items: T[], rng: Rng): T => items[Math.floor(rng() * items.length)];

/**
 * Lost eine Runde aus. Stehen mindestens 50 % des Topfs in `used`, wird `used`
 * vorher geleert, damit nie vorhersehbar ist, welche Begriffe noch übrig sind.
 */
export function drawRound(
  names: string[],
  impostorCount: number,
  pool: Entry[],
  used: string[],
  rng: Rng,
  withHint = false,
): { round: Round; used: string[] } {
  if (pool.length === 0) throw new Error("Leerer Topf");

  const poolNames = new Set(pool.map((e) => e.name));
  const usedInPool = used.filter((n) => poolNames.has(n));
  const baseUsed = usedInPool.length >= pool.length / 2 ? [] : used;

  const blocked = new Set(baseUsed);
  const word = pick(
    pool.filter((e) => !blocked.has(e.name)),
    rng,
  );
  const impostors = shuffle(names, rng).slice(0, impostorCount);
  const revealOrder = shuffle(names, rng);
  const starter = pick(names, rng);
  const hint = withHint && word.hints.length > 0 ? pick(word.hints, rng) : null;
  const start = names.indexOf(starter);
  const speakingOrder = [...names.slice(start), ...names.slice(0, start)];

  return {
    round: { word, hint, impostors, revealOrder, starter, speakingOrder, thinkSeconds: null, discussSeconds: null },
    used: [...baseUsed, word.name],
  };
}

/** Wahrscheinlichkeit für eine Runde ganz ohne Impostor im geheimen Modus. */
const NO_IMPOSTOR_CHANCE = 0.1;

/** Geheimer Modus: 10 % kein Impostor, die übrigen 90 % gleich verteilt auf 1 bis max. */
export function drawImpostorCount(max: number, rng: Rng): number {
  const r = rng();
  if (r < NO_IMPOSTOR_CHANCE) return 0;
  const share = (r - NO_IMPOSTOR_CHANCE) / (1 - NO_IMPOSTOR_CHANCE);
  return Math.min(max, 1 + Math.floor(share * max));
}
