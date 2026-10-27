import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SetupScreen from "../../src/screens/SetupScreen";

describe("Spielmodi in der Einrichtung", () => {
  it("zeigt die Schwierigkeit nur bei 'Alle Fußballer'", async () => {
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Mittel" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Spielmodus"), "vereine-de");
    expect(screen.queryByRole("button", { name: "Mittel" })).not.toBeInTheDocument();
  });

  it("bietet BVB mit unverändertem Label an und startet damit", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen initial={null} onStart={onStart} />);
    expect(screen.getByRole("option", { name: "🟡 BVB" })).toHaveValue("bvb");
    await user.selectOptions(screen.getByLabelText("Spielmodus"), "bvb");
    for (const name of ["Anna", "Ben", "Cem"]) await user.type(screen.getByLabelText("Name"), name + "{Enter}");
    expect(screen.queryByRole("button", { name: "Mittel" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ mode: "bvb" }));
  });
});
