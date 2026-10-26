import { useEffect, useReducer, useRef, useState } from "react";
import clubsJson from "./data/clubs.json";
import playersJson from "./data/players.json";
import { nextRound } from "./game/session";
import { reducer, restore, type GameState } from "./game/state";
import type { Club, Footballer, Settings } from "./game/types";
import DiscussionScreen from "./screens/DiscussionScreen";
import HandoffScreen from "./screens/HandoffScreen";
import ResolutionScreen from "./screens/ResolutionScreen";
import RevealScreen from "./screens/RevealScreen";
import SetupScreen from "./screens/SetupScreen";
import { loadGame, loadSettings, loadUsed, saveGame, saveSettings, saveUsed } from "./storage";

const players = playersJson as Footballer[];
const clubs = clubsJson as Club[];

function initialState(): GameState {
  const saved = loadGame();
  return saved ? restore(saved) : { phase: "setup" };
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [settings, setSettings] = useState<Settings | null>(loadSettings);
  const phase = useRef(state.phase);
  const guarded = useRef(false);
  phase.current = state.phase;

  useEffect(() => saveGame(state), [state]);

  // Sperrbildschirm oder App-Wechsel: offene Karte verdecken, zurück zur Übergabe.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") dispatch({ type: "hide" });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Während einer Runde liegt ein zusätzlicher History-Eintrag oben, damit die
  // Zurück-Geste abgefangen wird statt die App zu verlassen.
  useEffect(() => {
    if (state.phase !== "setup" && !guarded.current) {
      history.pushState({ impostor: true }, "");
      guarded.current = true;
    }
  }, [state.phase]);

  useEffect(() => {
    function onPopState() {
      guarded.current = false;
      if (phase.current === "setup") return;
      if (window.confirm("Runde abbrechen?")) {
        dispatch({ type: "toSetup" });
      } else {
        history.pushState({ impostor: true }, "");
        guarded.current = true;
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function startRound(s: Settings) {
    const { round, used } = nextRound(s, players, clubs, loadUsed(), Math.random);
    saveUsed(used);
    dispatch({ type: "start", round });
  }

  switch (state.phase) {
    case "setup":
      return (
        <SetupScreen
          initial={settings}
          onStart={(s) => {
            setSettings(s);
            saveSettings(s);
            startRound(s);
          }}
        />
      );
    case "handoff":
      return <HandoffScreen name={state.round.revealOrder[state.index]} onConfirm={() => dispatch({ type: "confirm" })} />;
    case "reveal": {
      const name = state.round.revealOrder[state.index];
      return (
        <RevealScreen
          key={state.index}
          isImpostor={state.round.impostors.includes(name)}
          word={state.round.word.name}
          canPass={state.seen}
          onSeen={() => dispatch({ type: "seen" })}
          onPassOn={() => dispatch({ type: "passOn" })}
        />
      );
    }
    case "discussion":
      return <DiscussionScreen starter={state.round.starter} onResolve={() => dispatch({ type: "resolve" })} />;
    case "resolution":
      return (
        <ResolutionScreen
          round={state.round}
          onNewRound={() => (settings ? startRound(settings) : dispatch({ type: "toSetup" }))}
          onSettings={() => dispatch({ type: "toSetup" })}
        />
      );
  }
}
