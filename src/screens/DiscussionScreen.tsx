import HoldButton from "../components/HoldButton";
import { displayName } from "../displayName";

type Props = { starter: string; onResolve: () => void };

export default function DiscussionScreen({ starter, onResolve }: Props) {
  return (
    <main className="screen">
      <p className="eyebrow">Alle haben ihr Wort gesehen</p>
      <h1 className="big-name">{displayName(starter)} beginnt</h1>
      <p className="hint">Zum Auflösen gedrückt halten</p>
      <HoldButton label="Auflösen" onComplete={onResolve} />
    </main>
  );
}
