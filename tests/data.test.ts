import { describe, expect, it } from "vitest";
import clubsJson from "../src/data/clubs.json";
import playersJson from "../src/data/players.json";
import { MODES, poolFor } from "../src/game/modes";
import type { Club, Footballer, Tier } from "../src/game/types";

const players = playersJson as Footballer[];
const clubs = clubsJson as Club[];
const TAGS = ["bundesliga", "cl-legende", "wm-legende", "fifa-icon"];
const POSITIONS = [
  "Torwart",
  "Innenverteidiger",
  "Außenverteidiger",
  "Defensives Mittelfeld",
  "Zentrales Mittelfeld",
  "Offensives Mittelfeld",
  "Flügelspieler",
  "Stürmer",
];

const CLUB_VALUES = {
  color: ["Rot", "Blau", "Weiß", "Schwarz", "Gelb", "Grün", "Orange", "Lila"],
  league: [
    "Bundesliga",
    "Premier League",
    "LaLiga",
    "Serie A",
    "Ligue 1",
    "Eredivisie",
    "Liga Portugal",
    "Süper Lig",
    "Scottish Premiership",
    "Österreichische Bundesliga",
  ],
  character: [
    "Traditionsverein",
    "Werksklub",
    "Großklub",
    "Kultklub",
    "Investorenklub",
    "Ausbildungsverein",
    "Arbeiterklub",
    "Stimmungshochburg",
  ],
  success: ["Champions-League-Sieger", "Europapokalsieger", "Meister", "Pokalsieger", "noch nie Meister"],
  crest: [
    "Tier im Wappen",
    "Stern im Wappen",
    "Buchstaben im Wappen",
    "Krone im Wappen",
    "Kreuz im Wappen",
    "Kreis-Wappen",
  ],
};

const words = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);

/** Ein Tipp verrät den Namen, wenn ein Wort im anderen steckt (z. B. „Hamburg“ in „Hamburger SV“). */
function leaks(name: string, hint: string): boolean {
  const nameWords = words(name);
  return words(hint).some((h) => nameWords.some((n) => n.includes(h) || h.includes(n)));
}

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

  it("hat nur gültige Stufen und Tags", () => {
    const invalid = players.filter((p) => ![1, 2, 3].includes(p.tier) || !p.tags.every((t) => TAGS.includes(t)));
    expect(invalid).toEqual([]);
  });

  it("hat für jeden Spieler Nation und gültige Position", () => {
    const invalid = players.filter(
      (p) =>
        !p.hints?.nation?.trim() ||
        !POSITIONS.includes(p.hints.position) ||
        (p.hints.special !== null && !p.hints.special.trim()),
    );
    expect(invalid.map((p) => p.name)).toEqual([]);
  });

  it("hat für jeden Spieler eine Besonderheit ohne Jahreszahlen oder Daten", () => {
    expect(players.filter((p) => !p.hints.special || /\d/.test(p.hints.special)).map((p) => p.name)).toEqual([]);
  });

  it("verrät in keinem Tipp den Spielernamen", () => {
    const leaking = players.flatMap((p) =>
      [p.hints.nation, p.hints.special ?? ""].filter((h) => leaks(p.name, h)).map((h) => `${p.name}: ${h}`),
    );
    expect(leaking).toEqual([]);
  });

  it("erreicht die Mindestgrößen", () => {
    expect(players.filter((p) => p.tier === 1).length).toBeGreaterThanOrEqual(60);
    expect(players.filter((p) => p.tags.includes("bundesliga")).length).toBeGreaterThanOrEqual(150);
    expect(players.filter((p) => p.tags.includes("cl-legende")).length).toBeGreaterThanOrEqual(50);
    expect(players.filter((p) => p.tags.includes("wm-legende")).length).toBeGreaterThanOrEqual(50);
    expect(players.filter((p) => p.tags.includes("fifa-icon")).length).toBeGreaterThanOrEqual(120);
  });
});

describe("clubs.json", () => {
  it("hat keine doppelten oder leeren Namen und gültige Regionen", () => {
    expect(duplicates(clubs.map((c) => c.name))).toEqual([]);
    expect(clubs.filter((c) => c.name.trim() === "" || !["de", "int"].includes(c.region))).toEqual([]);
  });

  it("hat für jeden Verein eine Region und nur Werte aus den festen Listen", () => {
    const invalid = clubs.filter(
      (c) =>
        !c.hints?.region?.trim() ||
        (Object.keys(CLUB_VALUES) as (keyof typeof CLUB_VALUES)[]).some((key) => !CLUB_VALUES[key].includes(c.hints[key])),
    );
    expect(invalid.map((c) => c.name)).toEqual([]);
  });

  it("verrät mit der Region nicht den Vereinsnamen", () => {
    expect(clubs.filter((c) => leaks(c.name, c.hints.region)).map((c) => `${c.name}: ${c.hints.region}`)).toEqual([]);
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
