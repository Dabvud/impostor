import { describe, expect, it } from "vitest";
import { nextRound } from "../../src/game/session";
import type { Settings } from "../../src/game/types";

const settings: Settings = {
  names: [], impostorCount: 1, mode: "alle", difficulty: 2, hintsEnabled: true,
  secretImpostors: false, thinkSeconds: 30, discussSeconds: 120, groupId: null, guessEnabled: true,
};

describe("Grenzen der Alle-Impostor-Runde", () => {
  it("erlaubt „alle Impostor“ bei Spielern nur bis 10, bei Vereinen nur bis 6 Mitspielern", () => {
    const allOrNone = (mode: Settings["mode"], count: number) => {
      const names = Array.from({ length: count }, (_, i) => `S${i}`);
      const s = { ...settings, mode, names, secretImpostors: true };
      return nextRound(s, {}, () => 0).round.impostors.length;
    };
    expect(allOrNone("vereine-de", 6)).toBe(6);
    expect(allOrNone("vereine-de", 7)).toBe(0);
    expect(allOrNone("alle", 10)).toBe(10);
    expect(allOrNone("alle", 11)).toBe(0);
  });
});
