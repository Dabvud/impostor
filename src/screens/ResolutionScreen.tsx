import type { Round } from "../game/types";

type Props = { round: Round; onNewRound: () => void; onSettings: () => void };

export default function ResolutionScreen({ round, onNewRound, onSettings }: Props) {
  return (
    <main className="screen">
      <p className="eyebrow">{round.impostors.length > 1 ? "Die Impostor waren" : "Der Impostor war"}</p>
      <ul className="impostor-list">
        {round.impostors.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="eyebrow">Das Wort war</p>
      <p className="word">{round.word.name}</p>
      <button type="button" className="primary" onClick={onNewRound}>
        Neue Runde
      </button>
      <button type="button" onClick={onSettings}>
        Einstellungen
      </button>
    </main>
  );
}
