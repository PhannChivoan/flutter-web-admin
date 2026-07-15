"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminHeader } from "../../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { inputStyle, glassStyle, type Theater } from "../../../shared";
import { ApiMovie } from "../../../scheduleShared";

export default function NewScreeningPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theaterId = Number(params.id);
  useAdminHeader("New Screening", "Schedule a movie screening for this branch.");

  const [theater, setTheater] = useState<Theater | null>(null);
  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const [movieId, setMovieId] = useState<number | "">("");
  const [screenId, setScreenId] = useState<number | "">(searchParams.get("screenId") ? Number(searchParams.get("screenId")) : "");
  const [date, setDate] = useState(searchParams.get("date") ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:30");
  const [price, setPrice] = useState("12.50");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<Theater>(`/theaters/${theaterId}`, { auth: false }),
      apiFetch<ApiMovie[]>("/movies", { auth: false }),
    ])
      .then(([t, m]) => {
        setTheater(t);
        setMovies(m);
        setMovieId((prev) => prev || m[0]?.movie_id || "");
        setScreenId((prev) => prev || (t as any).screens[0]?.screen_id || "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load data"));
  }, [theaterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieId || !screenId) return;
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/showtimes", {
        method: "POST",
        body: JSON.stringify({
          movie_id: movieId,
          screen_id: screenId,
          show_date: date,
          show_time: `1970-01-01T${time}:00.000Z`,
          ticket_price: Number(price),
        }),
      });
      router.push(`/admin/branches/${theaterId}/schedule`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to schedule screening");
      setSaving(false);
    }
  };

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <form onSubmit={handleSubmit} className="max-w-md rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Movie</label>
          <select required value={movieId} onChange={(e) => setMovieId(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle}>
            <option value="">Select a movie</option>
            {movies.map((m) => (
              <option key={m.movie_id} value={m.movie_id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Screen</label>
          <select required value={screenId} onChange={(e) => setScreenId(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle}>
            <option value="">Select a screen</option>
            {theater?.screens?.map((s: any) => (
              <option key={s.screen_id} value={s.screen_id}>{s.screen_name} ({s.format_type})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Date</label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Time</label>
            <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Price</label>
            <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Schedule"}</button>
        </div>
      </form>
    </main>
  );
}
