import type { Round } from "./types";

export type GameState =
  | { phase: "setup" }
  | { phase: "handoff"; round: Round; index: number }
  | { phase: "reveal"; round: Round; index: number; seen: boolean }
  | { phase: "discussion"; round: Round }
  | { phase: "resolution"; round: Round };

export type Action =
  | { type: "start"; round: Round }
  | { type: "confirm" }
  | { type: "seen" }
  | { type: "passOn" }
  | { type: "resolve" }
  | { type: "toSetup" };

/** Aktionen, die in der aktuellen Phase nicht gültig sind, lassen den Zustand unverändert. */
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return state.phase === "setup" || state.phase === "resolution"
        ? { phase: "handoff", round: action.round, index: 0 }
        : state;
    case "confirm":
      return state.phase === "handoff" ? { ...state, phase: "reveal", seen: false } : state;
    case "seen":
      return state.phase === "reveal" && !state.seen ? { ...state, seen: true } : state;
    case "passOn": {
      if (state.phase !== "reveal" || !state.seen) return state;
      const index = state.index + 1;
      return index < state.round.revealOrder.length
        ? { phase: "handoff", round: state.round, index }
        : { phase: "discussion", round: state.round };
    }
    case "resolve":
      return state.phase === "discussion" ? { phase: "resolution", round: state.round } : state;
    case "toSetup":
      return state.phase === "setup" ? state : { phase: "setup" };
  }
}

/** Nach Neuladen nie eine offene Karte zeigen, sondern zurück zur Übergabe. */
export function restore(saved: GameState): GameState {
  return saved.phase === "reveal" ? { phase: "handoff", round: saved.round, index: saved.index } : saved;
}
