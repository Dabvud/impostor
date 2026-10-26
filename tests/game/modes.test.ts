import { describe, expect, it } from "vitest";
import { MODES, poolFor, poolKey } from "../../src/game/modes";
import type { Club, Footballer } from "../../src/game/types";

const players: Footballer[] = [
  { name: "A", tier: 1, tags: ["bundesliga"], hints: { nation: "Land A", position: "Torwart", special: "Trick A" } },
  { name: "B", tier: 2, tags: ["cl-legende"], hints: { nation: "Land B", position: "Stürmer", special: null } },
  { name: "C", tier: 3, tags: ["wm-legende", "bundesliga", "fifa-icon"], hints: { nation: "Land C", position: "Stürmer", special: null } },
];
const clubs: Club[] = [
  { name: "X", region: "de", inAllClubs: true, hints: { region: "Region X", colors: "Rot" } },
  { name: "Y", region: "int", inAllClubs: true, hints: { region: "Region Y", colors: "Blau" } },
  { name: "Z", region: "de", inAllClubs: false, hints: { region: "Region Z", colors: "Grün" } },
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
    expect(names("fifa-icons")).toEqual(["C"]);
    expect(names("vereine-de")).toEqual(["X", "Z"]);
    expect(names("vereine-int")).toEqual(["X", "Y"]);
  });

  it("liefert Name und die vorhandenen Tipps als Liste", () => {
    expect(poolFor("alle", 2, players, clubs)).toEqual([
      { name: "A", hints: ["Land A", "Torwart", "Trick A"] },
      { name: "B", hints: ["Land B", "Stürmer"] },
    ]);
    expect(poolFor("vereine-int", 1, players, clubs)).toEqual([
      { name: "X", hints: ["Region X", "Rot"] },
      { name: "Y", hints: ["Region Y", "Blau"] },
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
  it("hat sieben Modi mit exakten Labels, nur 'alle' mit Schwierigkeit", () => {
    expect(MODES).toEqual([
      { id: "alle", label: "⚽ Alle Fußballer", hasDifficulty: true },
      { id: "bundesliga", label: "🇩🇪 Bundesliga", hasDifficulty: false },
      { id: "cl-legenden", label: "🏆 CL-Legenden", hasDifficulty: false },
      { id: "wm-legenden", label: "🌍 WM-Legenden", hasDifficulty: false },
      { id: "fifa-icons", label: "🎮 FIFA Icons", hasDifficulty: false },
      { id: "vereine-de", label: "🏟️ Vereine Bundesliga", hasDifficulty: false },
      { id: "vereine-int", label: "🌐 Alle Vereine", hasDifficulty: false },
    ]);
  });
});
