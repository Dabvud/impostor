import { useRef, useState, type FormEvent } from "react";
import { displayName } from "../displayName";
import { MODES } from "../game/modes";
import { maxImpostors, normalizeNames, validateSettings } from "../game/settings";
import type { ModeId, Settings, Tier } from "../game/types";

const DIFFICULTIES: { tier: Tier; label: string }[] = [
  { tier: 1, label: "Leicht" },
  { tier: 2, label: "Mittel" },
  { tier: 3, label: "Schwer" },
];

type Props = { initial: Settings | null; onStart: (s: Settings) => void };

export default function SetupScreen({ initial, onStart }: Props) {
  const [names, setNames] = useState<string[]>(initial?.names ?? []);
  const [draft, setDraft] = useState("");
  const [duplicateHint, setDuplicateHint] = useState<string | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [impostorCount, setImpostorCount] = useState(initial?.impostorCount ?? 1);
  const [mode, setMode] = useState<ModeId>(initial?.mode ?? "alle");
  const [difficulty, setDifficulty] = useState<Tier>(initial?.difficulty ?? 1);
  const [hintsEnabled, setHintsEnabled] = useState(initial?.hintsEnabled ?? true);

  const max = maxImpostors(names.length);
  const settings: Settings = { names, impostorCount, mode, difficulty, hintsEnabled };
  const errors = validateSettings(settings);
  const hasDifficulty = MODES.find((m) => m.id === mode)?.hasDifficulty ?? false;

  function addName(e: FormEvent) {
    e.preventDefault();
    const [name] = normalizeNames([draft]);
    const existing = name && names.find((n) => n.toLowerCase() === name.toLowerCase());
    if (existing) {
      // Name bleibt stehen, damit man nur noch z. B. „M.“ ergänzen muss.
      setDuplicateHint(`${existing} ist schon dabei – z. B. „${existing} M.“ eintragen`);
      setDraft(`${name} `);
    } else {
      if (name) setNames([...names, name]);
      setDuplicateHint(null);
      setDraft("");
    }
    // Fokus behalten, damit die Handy-Tastatur für den nächsten Namen offen bleibt.
    nameInput.current?.focus();
  }

  function removeName(index: number) {
    const next = names.filter((_, i) => i !== index);
    setNames(next);
    setImpostorCount((c) => Math.min(c, maxImpostors(next.length)));
  }

  return (
    <main className="screen setup">
      <h1 className="title">Impostor</h1>

      <section className="panel">
        <h2>Spieler</h2>
        <ul className="name-list">
          {names.map((name, i) => (
            <li key={`${name}-${i}`}>
              <span>{displayName(name)}</span>
              <button type="button" className="icon-button" aria-label={`${name} entfernen`} onClick={() => removeName(i)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
        <form className="add-name" onSubmit={addName}>
          <input
            ref={nameInput}
            aria-label="Name"
            enterKeyHint="enter"
            placeholder="Name"
            value={draft}
            maxLength={20}
            autoComplete="off"
            onChange={(e) => setDraft(e.target.value)}
          />
          {/* preventDefault: Tippen auf den Button soll das Namensfeld nicht verlassen */}
          <button type="submit" onPointerDown={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()}>
            Hinzufügen
          </button>
        </form>
        {duplicateHint && <p className="field-hint">{duplicateHint}</p>}
      </section>

      <section className="panel">
        <h2>Impostor</h2>
        <label className="switch-row">
          <span>Tipp für Impostor</span>
          <input
            type="checkbox"
            role="switch"
            checked={hintsEnabled}
            onChange={(e) => setHintsEnabled(e.target.checked)}
          />
        </label>
        <div className="stepper">
          <button
            type="button"
            aria-label="Weniger Impostor"
            disabled={impostorCount <= 1}
            onClick={() => setImpostorCount(impostorCount - 1)}
          >
            −
          </button>
          <output aria-label="Anzahl Impostor">{impostorCount}</output>
          <button
            type="button"
            aria-label="Mehr Impostor"
            disabled={impostorCount >= max}
            onClick={() => setImpostorCount(impostorCount + 1)}
          >
            +
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Spielmodus</h2>
        <select aria-label="Spielmodus" value={mode} onChange={(e) => setMode(e.target.value as ModeId)}>
          {MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        {hasDifficulty && (
          <div className="segmented">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.tier}
                type="button"
                aria-pressed={difficulty === d.tier}
                onClick={() => setDifficulty(d.tier)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {errors.length > 0 && (
        <ul className="errors">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <button type="button" className="primary" disabled={errors.length > 0} onClick={() => onStart({ ...settings, names: normalizeNames(names) })}>
        Start
      </button>
    </main>
  );
}
