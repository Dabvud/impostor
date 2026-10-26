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

  return { round: { word, hint, impostors, revealOrder, starter }, used: [...baseUsed, word.name] };
}
