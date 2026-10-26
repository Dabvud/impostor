import RevealCard from "../components/RevealCard";

type Props = { isImpostor: boolean; word: string; canPass: boolean; onSeen: () => void; onPassOn: () => void };

export default function RevealScreen({ isImpostor, word, canPass, onSeen, onPassOn }: Props) {
  return (
    <main className="screen reveal">
      <RevealCard onReveal={onSeen}>
        {isImpostor ? <span className="impostor">🕵️ Du bist der Impostor</span> : <span className="word">{word}</span>}
      </RevealCard>
      <button type="button" className="primary" disabled={!canPass} onClick={onPassOn}>
        Fertig – weitergeben
      </button>
    </main>
  );
}
