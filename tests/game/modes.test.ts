import { describe, expect, it } from "vitest";
import { MODES, poolFor, poolKey } from "../../src/game/modes";
import type { Club, Footballer } from "../../src/game/types";

const players: Footballer[] = [
  { name: "A", tier: 1, tags: ["bundesliga"], hint: null },
  { name: "B", tier: 2, tags: ["cl-legende"], hint: null },
  { name: "C", tier: 3, tags: ["wm-legende", "bundesliga"], hint: null },
];
const clubs: Club[] = [
  { name: "X", region: "de", inAllClubs: true, hint: null },
  { name: "Y", region: "int", inAllClubs: true, hint: null },
  { name: "Z", region: "de", inAllClubs: false, hint: null },
];
const names = (mode: Parameters<typeof poolFor>[0], difficulty: 1 | 2 | 3 = 1) =>
  poolFor(mode, difficulty, players, clubs).map((e) => e.name);

describe("poolFor", () => {
  it("wendet die Schwierigkeit bei 'alle' kumulativ an", () => {
    expect(names("alle", 1)).toEqual(["A"]);
    expect(names("alle", 2)).toEqual(["A", "B"]);
    expect(names("alle", 3)).toEqual(["A", "B", "C"]);
  });

  it("ignoriert die Schwierigkeit bei Bundesliga", () => {
    expect(names("bundesliga", 1)).toEqual(["A", "C"]);
    expect(names("bundesliga", 3)).toEqual(["A", "C"]);
  });

  it("filtert Legenden und Vereine", () => {
    expect(names("cl-legenden")).toEqual(["B"]);
    expect(names("wm-legenden")).toEqual(["C"]);
    expect(names("vereine-de")).toEqual(["X", "Z"]);
    expect(names("vereine-int")).toEqual(["X", "Y"]);
  });

  it("liefert nur name und hint", () => {
    expect(poolFor("alle", 1, players, clubs)).toEqual([{ name: "A", hint: null }]);
    expect(poolFor("vereine-int", 1, players, clubs)).toEqual([
      { name: "X", hint: null },
      { name: "Y", hint: null },
    ]);
  });
});

describe("poolKey", () => {
  it("enthält die Schwierigkeit nur bei 'alle'", () => {
    expect(poolKey("alle", 2)).toBe("alle-2");
    expect(poolKey("vereine-de", 3)).toBe("vereine-de");
  });
});

describe("MODES", () => {
  it("hat sechs Modi mit exakten Labels, nur 'alle' mit Schwierigkeit", () => {
    expect(MODES).toEqual([
      { id: "alle", label: "⚽ Alle Fußballer", hasDifficulty: true },
      { id: "bundesliga", label: "🇩🇪 Bundesliga", hasDifficulty: false },
      { id: "cl-legenden", label: "🏆 CL-Legenden", hasDifficulty: false },
      { id: "wm-legenden", label: "🌍 WM-Legenden", hasDifficulty: false },
      { id: "vereine-de", label: "🏟️ Vereine Bundesliga", hasDifficulty: false },
      { id: "vereine-int", label: "🌐 Alle Vereine", hasDifficulty: false },
    ]);
  });
});
