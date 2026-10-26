import { MODES } from "./game/modes";
import type { UsedMap } from "./game/session";
import type { GameState } from "./game/state";
import type { Round, Settings } from "./game/types";

const KEYS = {
  settings: "impostor:v1:settings",
  game: "impostor:v1:game",
  used: "impostor:v1:used",
};

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speicher voll oder blockiert: Spiel läuft trotzdem weiter.
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

function isSettings(v: unknown): v is Settings {
  return (
    isObject(v) &&
    isStringArray(v.names) &&
    typeof v.impostorCount === "number" &&
    MODES.some((m) => m.id === v.mode) &&
    [1, 2, 3].includes(v.difficulty as number)
  );
}

function isRound(v: unknown): v is Round {
  return (
    isObject(v) &&
    isObject(v.word) &&
    typeof v.word.name === "string" &&
    isStringArray(v.impostors) &&
    isStringArray(v.revealOrder) &&
    v.revealOrder.length > 0 &&
    typeof v.starter === "string"
  );
}

function isGameState(v: unknown): v is GameState {
  if (!isObject(v)) return false;
  switch (v.phase) {
    case "setup":
      return true;
    case "handoff":
    case "reveal":
      return isRound(v.round) && typeof v.index === "number" && v.index >= 0 && v.index < v.round.revealOrder.length;
    case "discussion":
    case "resolution":
      return isRound(v.round);
    default:
      return false;
  }
}

export function loadSettings(): Settings | null {
  const v = read(KEYS.settings);
  return isSettings(v) ? v : null;
}

export function saveSettings(s: Settings): void {
  write(KEYS.settings, s);
}

export function loadGame(): GameState | null {
  const v = read(KEYS.game);
  return isGameState(v) ? v : null;
}

export function saveGame(g: GameState): void {
  write(KEYS.game, g);
}

export function loadUsed(): UsedMap {
  const v = read(KEYS.used);
  if (!isObject(v)) return {};
  return Object.fromEntries(Object.entries(v).filter(([, list]) => isStringArray(list))) as UsedMap;
}

export function saveUsed(u: UsedMap): void {
  write(KEYS.used, u);
}
