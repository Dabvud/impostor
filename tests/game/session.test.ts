import { describe, expect, it } from "vitest";
import { nextRound } from "../../src/game/session";
import type { Club, Footballer, Settings } from "../../src/game/types";
import { seededRng } from "../helpers/rng";

const players: Footballer[] = [{ name: "A", tier: 1, tags: [], hints: { nation: "N", position: "Torwart", special: null } }];
const clubs: Club[] = [
  { name: "X", region: "de", inAllClubs: true, hints: { region: "R", colors: "F" } },
  { name: "Y", region: "de", inAllClubs: true, hints: { region: "R", colors: "F" } },
  { name: "Z", region: "de", inAllClubs: true, hints: { region: "R", colors: "F" } },
];
const settings: Settings = {
  names: [" Anna ", "Ben", "Cem"],
  impostorCount: 1,
  mode: "vereine-de",
  difficulty: 2,
  hintsEnabled: true,
};

describe("nextRound", () => {
  it("aktualisiert nur den Topf des gewählten Modus", () => {
    const used = { "alle-1": ["A"] };
    const result = nextRound(settings, players, clubs, used, seededRng(5));
    expect(result.used["alle-1"]).toEqual(["A"]);
    expect(result.used["vereine-de"]).toEqual([result.round.word.name]);
    expect(["X", "Y", "Z"]).toContain(result.round.word.name);
  });

  it("gibt mit eingeschaltetem Schalter einen Tipp, sonst keinen", () => {
    expect(nextRound(settings, players, clubs, {}, seededRng(5)).round.hint).toMatch(/^[RF]$/);
    expect(nextRound({ ...settings, hintsEnabled: false }, players, clubs, {}, seededRng(5)).round.hint).toBeNull();
  });

  it("verwendet normalisierte Namen", () => {
    const { round } = nextRound(settings, players, clubs, {}, seededRng(5));
    expect([...round.revealOrder].sort()).toEqual(["Anna", "Ben", "Cem"]);
  });
});
