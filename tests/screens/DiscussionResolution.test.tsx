import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Round } from "../../src/game/types";
import DiscussionScreen from "../../src/screens/DiscussionScreen";
import ResolutionScreen from "../../src/screens/ResolutionScreen";

const round: Round = {
  word: { name: "Messi", hints: ["Argentinien"] },
  hint: "Argentinien",
  impostors: ["Ben", "Dana"],
  revealOrder: ["Anna", "Ben", "Cem", "Dana", "Eli"],
  starter: "Jonas",
};

describe("DiscussionScreen", () => {
  it("zeigt den Starter und den Auflösen-Button", () => {
    render(<DiscussionScreen starter="Jonas" onResolve={vi.fn()} />);
    expect(screen.getByText("Jonas beginnt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auflösen" })).toBeInTheDocument();
  });
});

describe("ResolutionScreen", () => {
  it("zeigt Impostor und Wort und bietet neue Runde und Einstellungen", async () => {
    const user = userEvent.setup();
    const onNewRound = vi.fn();
    const onSettings = vi.fn();
    render(<ResolutionScreen round={round} onNewRound={onNewRound} onSettings={onSettings} />);
    expect(screen.getByText("Ben")).toBeInTheDocument();
    expect(screen.getByText("Dana")).toBeInTheDocument();
    expect(screen.getByText("Messi")).toBeInTheDocument();
    expect(screen.getByText("Tipp war: Argentinien")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 550));
    await user.click(screen.getByRole("button", { name: "Neue Runde" }));
    await user.click(screen.getByRole("button", { name: "Einstellungen" }));
    expect(onNewRound).toHaveBeenCalledOnce();
    expect(onSettings).toHaveBeenCalledOnce();
  });
});

describe("ResolutionScreen Klickschutz", () => {
  it("ignoriert Klicks in den ersten 500 ms (Geisterklick nach dem Halten)", () => {
    vi.useFakeTimers();
    try {
      const onNewRound = vi.fn();
      const onSettings = vi.fn();
      render(<ResolutionScreen round={round} onNewRound={onNewRound} onSettings={onSettings} />);
      fireEvent.click(screen.getByRole("button", { name: "Neue Runde" }));
      fireEvent.click(screen.getByRole("button", { name: "Einstellungen" }));
      expect(onNewRound).not.toHaveBeenCalled();
      expect(onSettings).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(500));
      fireEvent.click(screen.getByRole("button", { name: "Neue Runde" }));
      expect(onNewRound).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
});
