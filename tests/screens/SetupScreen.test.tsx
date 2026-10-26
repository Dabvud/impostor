import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Settings } from "../../src/game/types";
import SetupScreen from "../../src/screens/SetupScreen";

async function addNames(user: ReturnType<typeof userEvent.setup>, names: string[]) {
  for (const n of names) {
    await user.type(screen.getByLabelText("Name"), `${n}{Enter}`);
  }
}

describe("SetupScreen", () => {
  it("fügt Namen per Enter und Button hinzu und entfernt sie", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    await addNames(user, ["Anna"]);
    await user.type(screen.getByLabelText("Name"), "Ben");
    await user.click(screen.getByRole("button", { name: "Hinzufügen" }));
    expect(screen.getByText("Anna")).toBeInTheDocument();
    expect(screen.getByText("Ben")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Anna entfernen" }));
    expect(screen.queryByText("Anna")).not.toBeInTheDocument();
  });

  it("zeigt Paul in der Namensliste mit Regenbogen, speichert aber den echten Namen", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<SetupScreen initial={null} onStart={onStart} />);
    await addNames(user, ["Paul", "Ben", "Cem"]);
    expect(screen.getByText("Paul 🌈")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ names: ["Paul", "Ben", "Cem"] }));
  });

  it("lässt das Namensfeld nach Enter und nach „Hinzufügen“ aktiv, damit die Tastatur offen bleibt", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "Anna{Enter}");
    expect(input).toHaveFocus();
    await user.type(input, "Ben");
    await user.click(screen.getByRole("button", { name: "Hinzufügen" }));
    expect(input).toHaveFocus();
    expect(screen.getByText("Ben")).toBeInTheDocument();
  });

  it("nimmt doppelte Namen nicht auf und lässt den Namen zum Ergänzen stehen", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "Luca{Enter}");
    await user.type(input, " luca {Enter}");
    expect(screen.getAllByRole("button", { name: /entfernen$/ })).toHaveLength(1);
    expect(screen.getByText("Luca ist schon dabei – z. B. „Luca M.“ eintragen")).toBeInTheDocument();
    expect(input).toHaveValue("luca ");
    expect(input).toHaveFocus();
    await user.type(input, "M.{Enter}");
    expect(screen.getByText("luca M.")).toBeInTheDocument();
    expect(screen.queryByText(/ist schon dabei/)).not.toBeInTheDocument();
  });

  it("aktiviert Start erst ab 3 Spielern und zeigt die Fehlermeldung", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    await addNames(user, ["Anna", "Ben"]);
    expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
    expect(screen.getByText("Mindestens 3 Spieler")).toBeInTheDocument();
    await addNames(user, ["Cem"]);
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });

  it("zeigt die Schwierigkeit nur bei 'Alle Fußballer'", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Mittel" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Spielmodus"), "vereine-de");
    expect(screen.queryByRole("button", { name: "Mittel" })).not.toBeInTheDocument();
  });

  it("lässt die Impostor-Anzahl nicht über das Maximum steigen", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    await addNames(user, ["Anna", "Ben", "Cem", "Dana"]);
    expect(screen.getByRole("button", { name: "Mehr Impostor" })).toBeDisabled();
    expect(screen.getByLabelText("Anzahl Impostor")).toHaveTextContent("1");
  });

  it("korrigiert die Impostor-Anzahl, wenn Spieler entfernt werden", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const initial: Settings = {
      names: ["Anna", "Ben", "Cem", "Dana", "Eli", "Finn"],
      impostorCount: 2,
      mode: "alle",
      difficulty: 1,
      hintsEnabled: true,
    };
    render(<SetupScreen initial={initial} onStart={onStart} />);
    await user.click(screen.getByRole("button", { name: "Finn entfernen" }));
    expect(screen.getByLabelText("Anzahl Impostor")).toHaveTextContent("2");
    await user.click(screen.getByRole("button", { name: "Eli entfernen" }));
    expect(screen.getByLabelText("Anzahl Impostor")).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ impostorCount: 1 }));
  });

  it("füllt die letzten Einstellungen vor und startet mit normalisierten Namen", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const initial: Settings = {
      names: ["Anna", "Ben", "Cem"],
      impostorCount: 1,
      mode: "alle",
      difficulty: 3,
      hintsEnabled: true,
    };
    render(<SetupScreen initial={initial} onStart={onStart} />);
    await addNames(user, ["  Dana  "]);
    await user.selectOptions(screen.getByLabelText("Spielmodus"), "cl-legenden");
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledWith({
      names: ["Anna", "Ben", "Cem", "Dana"],
      impostorCount: 1,
      mode: "cl-legenden",
      difficulty: 3,
      hintsEnabled: true,
    });
  });

  it("schaltet den Tipp für Impostor an und aus", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<SetupScreen initial={null} onStart={onStart} />);
    const toggle = screen.getByRole("switch", { name: "Tipp für Impostor" });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    for (const n of ["Anna", "Ben", "Cem"]) await user.type(screen.getByLabelText("Name"), `${n}{Enter}`);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ hintsEnabled: false }));
  });
});
