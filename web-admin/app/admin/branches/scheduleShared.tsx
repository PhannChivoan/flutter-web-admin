"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";

export interface Screen {
  screen_id: number;
  theater_id: number;
  screen_name: string;
  format_type: "STANDARD" | "IMAX" | "IMAX_LASER" | "DOLBY_CINEMA";
  total_seats: number;
}

export interface ApiMovie {
  movie_id: number;
  title: string;
  content_rating: string | null;
  duration_min: number | null;
  poster_url: string | null;
}

export interface Showtime {
  showtime_id: number;
  movie_id: number;
  screen_id: number;
  show_date: string;
  show_time: string;
  availability: "AVAILABLE" | "FILLING_FAST" | "SOLD_OUT";
  seats_remaining: number;
  ticket_price: string;
  movie: ApiMovie;
  screen: Screen;
}

export const HOURS = ["12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"];
export const WINDOW_MINUTES = HOURS.length * 60;

export function timeToMinutesFromNoon(iso: string) {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes() - 720;
}

export function formatTimeRange(showTime: string, durationMin: number | null) {
  const start = new Date(showTime);
  const end = new Date(start.getTime() + (durationMin ?? 120) * 60000);
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ShowtimeBlock({ showtime, onDelete }: { showtime: Showtime; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const startMin = timeToMinutesFromNoon(showtime.show_time);
  const duration = showtime.movie.duration_min ?? 120;
  const leftPct = Math.max(0, Math.min(100, (startMin / WINDOW_MINUTES) * 100));
  const widthPct = Math.max(4, Math.min(100 - leftPct, (duration / WINDOW_MINUTES) * 100));
  const seatsUsed = showtime.screen.total_seats - showtime.seats_remaining;
  const pct = showtime.screen.total_seats > 0 ? Math.round((seatsUsed / showtime.screen.total_seats) * 100) : 0;
  const poster = apiUrl(showtime.movie.poster_url);
  const highlight = showtime.availability === "FILLING_FAST" || showtime.availability === "SOLD_OUT";

  return (
    <div
      className="absolute top-2 bottom-2 rounded-lg p-2 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        background: "#2a2a2a",
        border: `1px solid ${highlight ? (hovered ? "#e50914" : "rgba(229,9,20,0.30)") : hovered ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.10)"}`,
        boxShadow: highlight ? "0 0 15px rgba(229,9,20,0.4)" : hovered ? "0 6px 18px rgba(0,0,0,0.4)" : "none",
        zIndex: highlight ? 10 : 1,
        transform: hovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {poster && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${poster}')`, opacity: 0.2, zIndex: 0 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #2a2a2a, rgba(42,42,42,0.90), transparent)", zIndex: 0 }} />
        </>
      )}

      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(showtime.showtime_id);
          }}
          className="absolute top-1 right-1 flex items-center justify-center rounded-full transition-colors"
          style={{ width: 18, height: 18, background: "rgba(0,0,0,0.6)", color: "#ff8a80", zIndex: 2 }}
          title="Delete screening"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
        </button>
      )}

      <div className="relative flex justify-between items-start" style={{ zIndex: 1 }}>
        <div>
          <h3 className="text-xs font-semibold text-white truncate" style={{ maxWidth: 150 }}>{showtime.movie.title}</h3>
          <p className="text-[10px]" style={{ color: highlight ? "#ffb4aa" : "#e9bcb6", fontWeight: highlight ? 700 : 400 }}>
            {formatTimeRange(showtime.show_time, showtime.movie.duration_min)}
          </p>
        </div>
        <span
          className="text-[10px] text-white px-1.5 py-0.5 rounded"
          style={{ background: "rgba(26,26,26,0.80)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(4px)" }}
        >
          {showtime.movie.content_rating ?? "NR"}
        </span>
      </div>

      <div className="relative flex justify-between items-end mt-2" style={{ zIndex: 1 }}>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#ffb4aa" }}>chair</span>
          <span className="text-[10px]" style={{ color: highlight ? "#fff" : "#e9bcb6" }}>
            {seatsUsed}/{showtime.screen.total_seats}
          </span>
        </div>
        <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "#201f1f" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: "#e50914" }} />
        </div>
      </div>
    </div>
  );
}

export function ScreenRow({
  screen,
  showtimes,
  onDelete,
  onScheduleHere,
}: {
  screen: Screen;
  showtimes: Showtime[];
  onDelete: (id: number) => void;
  onScheduleHere: (screenId: number) => void;
}) {
  const [rowHovered, setRowHovered] = useState(false);
  const isEmpty = showtimes.length === 0;

  return (
    <div
      className="flex w-full transition-colors duration-200 relative"
      style={{
        minHeight: 80,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: rowHovered ? "rgba(53,53,52,0.30)" : "transparent",
      }}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
    >
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center"
        style={{ width: 96, borderRight: "1px solid rgba(255,255,255,0.05)", background: "rgba(32,31,31,0.50)" }}
      >
        <span className="text-xl font-semibold text-white">{screen.screen_id}</span>
        <span className="uppercase tracking-widest" style={{ fontSize: 10, color: "#ffb4aa" }}>{screen.format_type}</span>
      </div>

      {isEmpty ? (
        <button
          onClick={() => onScheduleHere(screen.screen_id)}
          className="flex-grow relative flex items-center justify-center m-2 rounded-lg transition-all duration-200 cursor-pointer"
          style={{ minWidth: 800, border: `2px dashed ${rowHovered ? "rgba(255,255,255,0.10)" : "transparent"}` }}
        >
          <div className="flex items-center gap-2 transition-opacity duration-200" style={{ color: "#e9bcb6", opacity: rowHovered ? 1 : 0 }}>
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-sm font-semibold">Click to schedule a screening</span>
          </div>
        </button>
      ) : (
        <div className="flex-grow relative overflow-hidden" style={{ minWidth: 800 }}>
          {showtimes.map((s) => (
            <ShowtimeBlock key={s.showtime_id} showtime={s} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
