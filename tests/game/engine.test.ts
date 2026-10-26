import { describe, expect, it } from "vitest";
import { drawImpostorCount, drawRound } from "../../src/game/engine";
import type { Entry } from "../../src/game/types";
import { seededRng } from "../helpers/rng";

const names = ["Anna", "Ben", "Cem", "Dana", "Eli"];
const pool: Entry[] = Array.from({ length: 10 }, (_, i) => ({ name: `E${i}`, hints: [`Tipp${i}a`, `Tipp${i}b`] }));
const poolNames = pool.map((e) => e.name);

describe("drawRound", () => {
  it.each([1, 2])("zieht genau %i verschiedene Impostor aus den Spielern", (count) => {
    const { round } = drawRound(names, count, pool, [], seededRng(7));
    expect(round.impostors).toHaveLength(count);
    expect(new Set(round.impostors).size).toBe(count);
    round.impostors.forEach((n) => expect(names).toContain(n));
  });

  it("liefert als Reihenfolge eine Permutation der Spieler", () => {
    const { round } = drawRound(names, 1, pool, [], seededRng(3));
    expect([...round.revealOrder].sort()).toEqual([...names].sort());
  });

  it("zieht den Starter aus allen Spielern, auch Impostor", () => {
    const starters = new Set<string>();
    let impostorStarted = false;
    for (let seed = 0; seed < 500; seed++) {
      const { round } = drawRound(names, 1, pool, [], seededRng(seed));
      expect(names).toContain(round.starter);
      starters.add(round.starter);
      if (round.impostors.includes(round.starter)) impostorStarted = true;
    }
    expect(starters.size).toBe(names.length);
    expect(impostorStarted).toBe(true);
  });

  it("zieht das Wort aus dem Topf, nicht aus used, und hängt es an used an", () => {
    const used = ["E0", "E1", "E2"];
    const result = drawRound(names, 1, pool, used, seededRng(11));
    expect(poolNames).toContain(result.round.word.name);
    expect(used).not.toContain(result.round.word.name);
    expect(result.used).toEqual([...used, result.round.word.name]);
  });

  it("leert used unter 50 % nicht", () => {
    const used = ["E0", "E1", "E2", "E3"];
    expect(drawRound(names, 1, pool, used, seededRng(1)).used).toHaveLength(5);
  });

  it("leert used ab 50 % des Topfs", () => {
    const used = ["E0", "E1", "E2", "E3", "E4"];
    const result = drawRound(names, 1, pool, used, seededRng(1));
    expect(result.used).toEqual([result.round.word.name]);
  });

  it("zählt fremde Einträge in used nicht zur 50-%-Grenze", () => {
    const foreign = ["X1", "X2", "X3", "X4", "X5", "X6"];
    const used = [...foreign, "E0", "E1", "E2", "E3"];
    const result = drawRound(names, 1, pool, used, seededRng(1));
    expect(result.used).toHaveLength(11);
  });

  it("entfernt fremde Einträge beim Leeren", () => {
    const used = ["X1", "E0", "E1", "E2", "E3", "E4"];
    const result = drawRound(names, 1, pool, used, seededRng(1));
    expect(result.used).toEqual([result.round.word.name]);
  });

  it("ist bei gleichem Seed reproduzierbar", () => {
    expect(drawRound(names, 2, pool, [], seededRng(99))).toEqual(drawRound(names, 2, pool, [], seededRng(99)));
  });

  it("zieht mit Tipp einen der Tipps des gezogenen Worts", () => {
    const tips = new Set<string | null>();
    for (let seed = 0; seed < 50; seed++) {
      const { round } = drawRound(names, 1, pool, [], seededRng(seed), true);
      expect(round.word.hints).toContain(round.hint);
      tips.add(round.hint?.slice(-1) ?? null);
    }
    expect(tips).toEqual(new Set(["a", "b"]));
  });

  it("zieht ohne Tipp-Schalter keinen Tipp", () => {
    expect(drawRound(names, 1, pool, [], seededRng(1), false).round.hint).toBeNull();
    expect(drawRound(names, 1, pool, [], seededRng(1)).round.hint).toBeNull();
  });

  it("liefert keinen Tipp, wenn das Wort keine Tipps hat", () => {
    const bare: Entry[] = [{ name: "Solo", hints: [] }];
    expect(drawRound(names, 1, bare, [], seededRng(1), true).round.hint).toBeNull();
  });

  it("legt die Hinweis-Reihenfolge ab dem Starter in Namensreihenfolge fest", () => {
    for (let seed = 0; seed < 20; seed++) {
      const { round } = drawRound(names, 1, pool, [], seededRng(seed));
      const start = names.indexOf(round.starter);
      expect(round.speakingOrder).toEqual([...names.slice(start), ...names.slice(0, start)]);
    }
  });

  it("erlaubt eine Runde ohne Impostor", () => {
    expect(drawRound(names, 0, pool, [], seededRng(3)).round.impostors).toEqual([]);
  });

  it("wirft bei leerem Topf", () => {
    expect(() => drawRound(names, 1, [], [], seededRng(1))).toThrow("Leerer Topf");
  });
});

describe("drawImpostorCount", () => {
  function distribution(max: number, draws = 20000) {
    const rng = seededRng(42);
    const counts = new Array(max + 1).fill(0);
    for (let i = 0; i < draws; i++) counts[drawImpostorCount(max, rng)]++;
    return counts.map((c) => c / draws);
  }

  it("gibt in 10 % der Fälle keinen Impostor, sonst gleich verteilt (max 1)", () => {
    const [none, one] = distribution(1);
    expect(none).toBeCloseTo(0.1, 1);
    expect(one).toBeCloseTo(0.9, 1);
  });

  it.each([2, 3])("verteilt bei max %i die übrigen 90 %% gleichmäßig", (max) => {
    const shares = distribution(max);
    expect(shares).toHaveLength(max + 1);
    expect(shares[0]).toBeCloseTo(0.1, 1);
    for (const share of shares.slice(1)) expect(share).toBeCloseTo(0.9 / max, 1);
  });

  it("bleibt immer zwischen 0 und max", () => {
    expect(drawImpostorCount(2, () => 0)).toBe(0);
    expect(drawImpostorCount(2, () => 0.0999)).toBe(0);
    expect(drawImpostorCount(2, () => 0.1)).toBe(1);
    expect(drawImpostorCount(2, () => 0.9999999)).toBe(2);
  });
});
