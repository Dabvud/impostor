import { describe, expect, it } from "vitest";
import { reducer, restore, type Action, type GameState } from "../../src/game/state";
import type { Round } from "../../src/game/types";

const round: Round = {
  word: { name: "Messi", hint: null },
  impostors: ["Ben"],
  revealOrder: ["Anna", "Ben", "Cem"],
  starter: "Cem",
};
const setup: GameState = { phase: "setup" };
const run = (state: GameState, ...actions: Action[]) => actions.reduce(reducer, state);
const turn: Action[] = [{ type: "confirm" }, { type: "seen" }, { type: "passOn" }];

describe("reducer", () => {
  it("durchläuft eine komplette Runde mit drei Spielern", () => {
    let s = run(setup, { type: "start", round });
    expect(s).toEqual({ phase: "handoff", round, index: 0 });
    s = run(s, { type: "confirm" });
    expect(s).toEqual({ phase: "reveal", round, index: 0, seen: false });
    s = run(s, { type: "seen" }, { type: "passOn" });
    expect(s).toEqual({ phase: "handoff", round, index: 1 });
    s = run(s, ...turn, ...turn);
    expect(s).toEqual({ phase: "discussion", round });
    s = run(s, { type: "resolve" });
    expect(s).toEqual({ phase: "resolution", round });
    const next = { ...round, starter: "Anna" };
    expect(run(s, { type: "start", round: next })).toEqual({ phase: "handoff", round: next, index: 0 });
  });

  it("lässt nicht weitergeben, bevor aufgedeckt wurde", () => {
    const s: GameState = { phase: "reveal", round, index: 0, seen: false };
    expect(reducer(s, { type: "passOn" })).toBe(s);
  });

  it("überspringt bei doppeltem Weitergeben keinen Spieler", () => {
    const s = run(setup, { type: "start", round }, ...turn, { type: "passOn" });
    expect(s).toEqual({ phase: "handoff", round, index: 1 });
  });

  it.each<[GameState, Action]>([
    [setup, { type: "confirm" }],
    [setup, { type: "passOn" }],
    [{ phase: "handoff", round, index: 0 }, { type: "resolve" }],
    [{ phase: "handoff", round, index: 0 }, { type: "start", round }],
    [{ phase: "handoff", round, index: 0 }, { type: "seen" }],
    [{ phase: "reveal", round, index: 0, seen: true }, { type: "confirm" }],
    [{ phase: "discussion", round }, { type: "passOn" }],
    [{ phase: "resolution", round }, { type: "resolve" }],
  ])("ignoriert ungültige Aktionen (%o, %o)", (state, action) => {
    expect(reducer(state, action)).toBe(state);
  });

  it("bricht aus jeder Phase zur Einrichtung ab", () => {
    expect(reducer({ phase: "reveal", round, index: 1, seen: true }, { type: "toSetup" })).toEqual(setup);
  });
});

describe("restore", () => {
  it("setzt eine offene Karte auf den Übergabe-Bildschirm zurück", () => {
    expect(restore({ phase: "reveal", round, index: 2, seen: true })).toEqual({ phase: "handoff", round, index: 2 });
  });

  it("lässt andere Phasen unverändert", () => {
    const s: GameState = { phase: "discussion", round };
    expect(restore(s)).toBe(s);
  });
});

describe("hide", () => {
  it("verdeckt eine offene Karte, wenn die App in den Hintergrund geht", () => {
    expect(reducer({ phase: "reveal", round, index: 1, seen: true }, { type: "hide" })).toEqual({
      phase: "handoff",
      round,
      index: 1,
    });
  });

  it("lässt andere Phasen unverändert", () => {
    const s: GameState = { phase: "discussion", round };
    expect(reducer(s, { type: "hide" })).toBe(s);
  });
});
