import RevealCard from "../components/RevealCard";

type Props = {
  isImpostor: boolean;
  word: string;
  hint: string | null;
  canPass: boolean;
  onSeen: () => void;
  onPassOn: () => void;
};

export default function RevealScreen({ isImpostor, word, hint, canPass, onSeen, onPassOn }: Props) {
  return (
    <main className="screen reveal">
      <RevealCard onReveal={onSeen}>
        {isImpostor ? (
          <div className="impostor-card">
            <span className="impostor">🕵️ Du bist der Impostor</span>
            {hint && <span className="tip">Tipp: {hint}</span>}
          </div>
        ) : (
          <span className="word">{word}</span>
        )}
      </RevealCard>
      <button type="button" className="primary" disabled={!canPass} onClick={onPassOn}>
        Fertig – weitergeben
      </button>
    </main>
  );
}
