import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import type { GameState } from "../src/game/state";
import { saveGame } from "../src/storage";

const round = {
  word: { name: "Schalke 04", hints: [] },
  hint: null,
  impostors: ["Ben"],
  revealOrder: ["Anna", "Ben", "Cem"],
  starter: "Cem",
};

function revealAndPass() {
  const card = screen.getByTestId("reveal-card");
  fireEvent.pointerDown(card, { clientY: 400, pointerId: 1 });
  fireEvent.pointerMove(card, { clientY: 250, pointerId: 1 });
  fireEvent.pointerUp(card, { clientY: 250, pointerId: 1 });
  fireEvent.click(screen.getByRole("button", { name: "Fertig – weitergeben" }));
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("App", () => {
  it("spielt eine komplette Runde und startet eine neue", async () => {
    const user = userEvent.setup();
    render(<App />);
    for (const name of ["Anna", "Ben", "Cem"]) await user.type(screen.getByLabelText("Name"), `${name}{Enter}`);
    await user.selectOptions(screen.getByLabelText("Spielmodus"), "vereine-de");
    await user.click(screen.getByRole("button", { name: "Start" }));

    for (let i = 0; i < 3; i++) {
      expect(screen.getByRole("heading", { name: /ist dran$/ })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /^Ich bin / }));
      revealAndPass();
    }

    expect(screen.getByRole("heading", { name: /beginnt$/ })).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Auflösen" }));
    expect(await screen.findByText("Das Wort war", {}, { timeout: 2000 })).toBeInTheDocument();

    await new Promise((r) => setTimeout(r, 550));
    await user.click(screen.getByRole("button", { name: "Neue Runde" }));
    expect(screen.getByRole("heading", { name: /ist dran$/ })).toBeInTheDocument();
  });

  it("setzt nach Neuladen beim Übergabe-Bildschirm des aktuellen Spielers fort", () => {
    saveGame({ phase: "reveal", round, index: 1, seen: true } satisfies GameState);
    render(<App />);
    expect(screen.getByRole("heading", { name: "Ben ist dran" })).toBeInTheDocument();
    expect(screen.queryByText("Schalke 04")).not.toBeInTheDocument();
  });

  it("verdeckt die Karte, wenn das Handy gesperrt oder die App gewechselt wird", () => {
    saveGame({ phase: "handoff", round, index: 0 });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Ich bin Anna" }));
    expect(screen.getByTestId("reveal-card")).toBeInTheDocument();

    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    fireEvent(document, new Event("visibilitychange"));
    visibility.mockReturnValue("visible");

    expect(screen.getByRole("heading", { name: "Anna ist dran" })).toBeInTheDocument();
  });

  it("fragt bei der Zurück-Geste, ob die Runde abgebrochen werden soll", () => {
    saveGame({ phase: "handoff", round, index: 0 });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);

    fireEvent.popState(window);
    expect(confirm).toHaveBeenCalledWith("Runde abbrechen?");
    expect(screen.getByRole("heading", { name: "Anna ist dran" })).toBeInTheDocument();

    confirm.mockReturnValue(true);
    fireEvent.popState(window);
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });
});

describe("Versionsanzeige", () => {
  it("zeigt Version und Build-Datum auf jedem Bildschirm", () => {
    render(<App />);
    expect(screen.getByText(/^v\d+\.\d+\.\d+ · \d{2}\.\d{2}\.\d{4}$/)).toBeInTheDocument();
  });
});
