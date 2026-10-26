import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "../src/game/state";
import type { Settings } from "../src/game/types";
import { loadGame, loadSettings, loadUsed, saveGame, saveSettings, saveUsed } from "../src/storage";

const settings: Settings = { names: ["Anna", "Ben", "Cem"], impostorCount: 1, mode: "vereine-int", difficulty: 2 };
const game: GameState = {
  phase: "reveal",
  index: 1,
  seen: true,
  round: { word: { name: "Messi", hint: null }, impostors: ["Ben"], revealOrder: ["Anna", "Ben", "Cem"], starter: "Cem" },
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("speichern und laden", () => {
  it("liefert dieselben Objekte zurück", () => {
    saveSettings(settings);
    saveGame(game);
    saveUsed({ "alle-1": ["Messi"] });
    expect(loadSettings()).toEqual(settings);
    expect(loadGame()).toEqual(game);
    expect(loadUsed()).toEqual({ "alle-1": ["Messi"] });
  });

  it("liefert ohne gespeicherte Daten null bzw. {}", () => {
    expect(loadSettings()).toBeNull();
    expect(loadGame()).toBeNull();
    expect(loadUsed()).toEqual({});
  });

  it("lädt die Einrichtungsphase ohne Runde", () => {
    saveGame({ phase: "setup" });
    expect(loadGame()).toEqual({ phase: "setup" });
  });
});

describe("kaputte Daten", () => {
  it("verwirft ungültiges JSON", () => {
    localStorage.setItem("impostor:v1:settings", "{kaputt");
    localStorage.setItem("impostor:v1:game", "{kaputt");
    localStorage.setItem("impostor:v1:used", "{kaputt");
    expect(loadSettings()).toBeNull();
    expect(loadGame()).toBeNull();
    expect(loadUsed()).toEqual({});
  });

  it("verwirft unbekannte Phasen und Runden ohne round", () => {
    localStorage.setItem("impostor:v1:game", JSON.stringify({ phase: "voting", round: game.round }));
    expect(loadGame()).toBeNull();
    localStorage.setItem("impostor:v1:game", JSON.stringify({ phase: "handoff", index: 0 }));
    expect(loadGame()).toBeNull();
  });

  it("verwirft Einstellungen mit unbekanntem Modus", () => {
    localStorage.setItem("impostor:v1:settings", JSON.stringify({ ...settings, mode: "kreisliga" }));
    expect(loadSettings()).toBeNull();
  });

  it("verwirft used-Einträge, die keine Listen sind", () => {
    localStorage.setItem("impostor:v1:used", JSON.stringify({ "alle-1": ["Messi"], "alle-2": "Messi", x: [1] }));
    expect(loadUsed()).toEqual({ "alle-1": ["Messi"] });
  });

  it("übersteht einen werfenden localStorage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blockiert");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blockiert");
    });
    expect(loadSettings()).toBeNull();
    expect(loadGame()).toBeNull();
    expect(loadUsed()).toEqual({});
    expect(() => saveGame(game)).not.toThrow();
  });
});
