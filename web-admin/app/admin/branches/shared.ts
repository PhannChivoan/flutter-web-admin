import type { CSSProperties } from "react";

export interface Theater {
  theater_id: number;
  theater_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  description: string | null;
  star_rating: string | null;
  image_url: string | null;
  latitude: string | null;
  longitude: string | null;
  screens: { screen_id: number }[];
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
