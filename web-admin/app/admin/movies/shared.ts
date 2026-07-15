import type { CSSProperties } from "react";

export type ApiMovieStatus = "NOW_SHOWING" | "COMING_SOON";
export type MovieStatus = "Now Playing" | "Coming Soon";

export interface Genre {
  genre_id: number;
  genre_name: string;
}

export interface CastEntry {
  cast_id: number;
  movie_id: number;
  actor_id: number;
  character_name: string;
  position: number;
}

export interface ApiMovie {
  movie_id: number;
  title: string;
  content_rating: string | null;
  duration_min: number | null;
  star_rating: string | null;
  status: ApiMovieStatus;
  release_date: string | null;
  synopsis: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  genre_id: number | null;
  genre?: Genre | null;
}

export const STATUS_LABEL: Record<ApiMovieStatus, MovieStatus> = {
  NOW_SHOWING: "Now Playing",
  COMING_SOON: "Coming Soon",
};

export type Filter = "All Movies" | MovieStatus;
export const FILTERS: Filter[] = ["All Movies", "Now Playing", "Coming Soon"];

export const STATUS_CONFIG: Record<MovieStatus, { color: string; shadow: string }> = {
  "Now Playing": { color: "#34d399", shadow: "rgba(52,211,153,0.5)" },
  "Coming Soon": { color: "#fbbf24", shadow: "rgba(251,191,36,0.5)" },
};

export const RATING_RED = new Set(["R", "NC-17"]);

export function formatDuration(mins: number | null) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export const inputStyle: CSSProperties = {
  background: "#201f1f",
  border: "1px solid #5e3f3b",
  color: "#fff",
  caretColor: "#ffb4aa",
};

export function glassStyle(extra?: CSSProperties): CSSProperties {
  return {
    background: "rgba(26,26,26,0.60)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.10)",
    ...extra,
  };
}
