import { expect, it } from "vitest";
import { APP_NAME, MANIFEST_DESCRIPTION, QR_COLORS, RULES_SUBJECT, SHARE_TEXT, STORAGE_PREFIX, THEME_COLOR } from "../../src/variant/config";

it("behält Namen, Texte, Farben und Speicherpräfix der bestehenden Variante bei", () => {
  expect({ APP_NAME, STORAGE_PREFIX, MANIFEST_DESCRIPTION, THEME_COLOR, SHARE_TEXT, RULES_SUBJECT, QR_COLORS }).toEqual({
    APP_NAME: "Impostor",
    STORAGE_PREFIX: "impostor",
    MANIFEST_DESCRIPTION: "Fußball-Impostor für eure Runde – ein Handy, alle Spieler.",
    THEME_COLOR: "#0f1a14",
    SHARE_TEXT: "Unser Fußball-Impostor für die nächste Runde:",
    RULES_SUBJECT: "denselben Fußballer oder Verein",
    QR_COLORS: { dark: "#062312", light: "#f2f5f0" },
  });
});
