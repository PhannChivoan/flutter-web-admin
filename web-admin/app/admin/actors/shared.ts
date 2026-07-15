import type { CSSProperties } from "react";

export interface Actor {
  actor_id: number;
  name: string;
  photo_url: string | null;
  bio: string | null;
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
