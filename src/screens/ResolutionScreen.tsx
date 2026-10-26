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

  // Alle Impostor: die Tipps stammen von verschiedenen Spielern, ein gemeinsames Wort gab es nicht.
  const everyone = round.impostors.length > 0 && round.impostors.length === round.revealOrder.length;

  return (
    <main className="screen">
      {round.impostors.length === 0 ? (
        <h1 className="big-name">Keiner war Impostor! 😄</h1>
      ) : everyone ? (
        <>
          <h1 className="big-name">Alle waren Impostor! 🤯</h1>
          <p className="hint">Es gab gar keinen Spieler.</p>
          {round.personalHints && (
            <ul className="personal-tips">
              {Object.entries(round.personalHints).map(([name, tip]) => (
                <li key={name}>
                  {displayName(name)}: {tip}
                </li>
              ))}
            </ul>
          )}
        </>
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
      {!everyone && (
        <>
          <p className="eyebrow">Das Wort war</p>
          <p className="word">{round.word.name}</p>
          {round.hint && <p className="hint">Tipp war: {round.hint}</p>}
        </>
      )}
      <button type="button" className="primary" onClick={() => armed && onNewRound()}>
        Neue Runde
      </button>
      <button type="button" onClick={() => armed && onSettings()}>
        Einstellungen
      </button>
    </main>
  );
}
