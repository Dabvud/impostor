import type { Tier } from "../game/types";

export type { Tier };
export type Tag = "bundesliga" | "cl-legende" | "wm-legende" | "fifa-icon" | "bvb";
/** Merkmale, aus denen der Tipp für den Impostor gezogen wird. */
export type PlayerHints = { nation: string; position: string; special: string | null };
export type ClubHints = {
  region: string;
  color: string;
  league: string;
  character: string;
  success: string;
  crest: string;
};
/** Zusätzliche Tipp-Kategorien, nur für die Runde, in der alle Impostor sind. */
export type PlayerExtras = {
  continent: string | null;
  league: string | null;
  playStyle: string | null;
  trait: string | null;
  moment: string | null;
  competition: string | null;
  title: string | null;
  hair: string | null;
  look: string | null;
  era: string | null;
  build: string | null;
  foot: string | null;
  careerType: string | null;
  shirtNumber: string | null;
  status: string | null;
  afterCareer: string | null;
  bundesliga: string | null;
  transfer: string | null;
};
export type ClubExtras = {
  stadium: string | null;
  founded: string | null;
  cityType: string | null;
  derby: string | null;
  sponsor: string | null;
  mascot: string | null;
};
export type Footballer = { name: string; tier: Tier; tags: Tag[]; hints: PlayerHints; extras?: PlayerExtras };
/** `inAllClubs`: erscheint im Modus „Alle Vereine“ (internationale Vereine immer, Bundesliga nur die relevanten). */
export type Club = { name: string; region: "de" | "int"; inAllClubs: boolean; hints: ClubHints; extras?: ClubExtras };
export type Team = "Tor" | "Abwehr" | "Mittelfeld" | "Angriff";
