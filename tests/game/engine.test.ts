import { describe, expect, it } from "vitest";
import { drawRound } from "../../src/game/engine";
import type { Entry } from "../../src/game/types";
import { seededRng } from "../helpers/rng";

const names = ["Anna", "Ben", "Cem", "Dana", "Eli"];
const pool: Entry[] = Array.from({ length: 10 }, (_, i) => ({ name: `E${i}`, hint: null }));
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

  it("wirft bei leerem Topf", () => {
    expect(() => drawRound(names, 1, [], [], seededRng(1))).toThrow("Leerer Topf");
  });
});
