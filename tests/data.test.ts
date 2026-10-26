import { describe, expect, it } from "vitest";
import clubsJson from "../src/data/clubs.json";
import playersJson from "../src/data/players.json";
import { MODES, poolFor } from "../src/game/modes";
import type { Club, Footballer, Tier } from "../src/game/types";

const players = playersJson as Footballer[];
const clubs = clubsJson as Club[];
const TAGS = ["bundesliga", "cl-legende", "wm-legende"];

function duplicates(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((n) => {
    const key = n.trim().toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
}

describe("players.json", () => {
  it("hat keine doppelten oder leeren Namen", () => {
    expect(duplicates(players.map((p) => p.name))).toEqual([]);
    expect(players.filter((p) => p.name.trim() === "")).toEqual([]);
  });

  it("hat nur gültige Stufen, Tags und kein Hilfswort", () => {
    const invalid = players.filter(
      (p) => ![1, 2, 3].includes(p.tier) || !p.tags.every((t) => TAGS.includes(t)) || p.hint !== null,
    );
    expect(invalid).toEqual([]);
  });

  it("erreicht die Mindestgrößen", () => {
    expect(players.filter((p) => p.tier === 1).length).toBeGreaterThanOrEqual(60);
    expect(players.filter((p) => p.tags.includes("bundesliga")).length).toBeGreaterThanOrEqual(150);
    expect(players.filter((p) => p.tags.includes("cl-legende")).length).toBeGreaterThanOrEqual(50);
    expect(players.filter((p) => p.tags.includes("wm-legende")).length).toBeGreaterThanOrEqual(50);
  });
});

describe("clubs.json", () => {
  it("hat keine doppelten oder leeren Namen, gültige Regionen und kein Hilfswort", () => {
    expect(duplicates(clubs.map((c) => c.name))).toEqual([]);
    expect(clubs.filter((c) => c.name.trim() === "" || !["de", "int"].includes(c.region) || c.hint !== null)).toEqual([]);
  });

  it("hat 23 deutsche und 44 internationale Vereine", () => {
    expect(clubs.filter((c) => c.region === "de")).toHaveLength(23);
    expect(clubs.filter((c) => c.region === "int")).toHaveLength(44);
  });

  it("nimmt alle internationalen und 17 Bundesliga-Vereine in „Alle Vereine“ auf", () => {
    expect(clubs.filter((c) => c.region === "int" && !c.inAllClubs)).toEqual([]);
    expect(
      clubs.filter((c) => c.region === "de" && !c.inAllClubs).map((c) => c.name).sort(),
    ).toEqual(["1. FC Heidenheim", "1. FC Nürnberg", "FC Augsburg", "Fortuna Düsseldorf", "Hannover 96", "VfL Bochum"]);
  });
});

describe("Spielmodi", () => {
  const cases = MODES.flatMap((m) =>
    m.hasDifficulty ? ([1, 2, 3] as Tier[]).map((d) => [m.id, d] as const) : [[m.id, 1 as Tier] as const],
  );
  it.each(cases)("%s (Stufe %i) hat mindestens 20 Einträge", (mode, difficulty) => {
    expect(poolFor(mode, difficulty, players, clubs).length).toBeGreaterThanOrEqual(20);
  });
});
