import { useEffect, useState } from "react";
import { displayName } from "../displayName";
import type { Round } from "../game/types";

/** Nach dem Gedrückthalten von „Auflösen“ kann iOS beim Loslassen einen Klick nachschicken. */
const CLICK_GUARD_MS = 500;

type Props = { round: Round; onNewRound: () => void; onSettings: () => void };

export default function ResolutionScreen({ round, onNewRound, onSettings }: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), CLICK_GUARD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="screen">
      {round.impostors.length === 0 ? (
        <h1 className="big-name">Keiner war Impostor! 😄</h1>
      ) : (
        <>
          <p className="eyebrow">{round.impostors.length > 1 ? "Die Impostor waren" : "Der Impostor war"}</p>
          <ul className="impostor-list">
            {round.impostors.map((name) => (
              <li key={name}>{displayName(name)}</li>
            ))}
          </ul>
        </>
      )}
      <p className="eyebrow">Das Wort war</p>
      <p className="word">{round.word.name}</p>
      {round.hint && <p className="hint">Tipp war: {round.hint}</p>}
      <button type="button" className="primary" onClick={() => armed && onNewRound()}>
        Neue Runde
      </button>
      <button type="button" onClick={() => armed && onSettings()}>
        Einstellungen
      </button>
    </main>
  );
}
