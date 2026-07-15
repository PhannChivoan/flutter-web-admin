"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { glassStyle, type Theater } from "../../shared";
import { HOURS, ScreenRow, Showtime, toDateInputValue } from "../../scheduleShared";

export default function BranchSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const theaterId = Number(params.id);

  const [theater, setTheater] = useState<Theater | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAdminHeader(
    theater ? `${theater.theater_name} Schedule` : "Branch Schedule",
    "Manage screenings, assign auditoriums, and configure pricing for this branch."
  );

  useEffect(() => {
    apiFetch<Theater>(`/theaters/${theaterId}`, { auth: false })
      .then(setTheater)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load branch"))
      .finally(() => setLoading(false));
  }, [theaterId]);

  useEffect(() => {
    const dateStr = toDateInputValue(selectedDate);
    apiFetch<Showtime[]>(`/showtimes?theater_id=${theaterId}&date=${dateStr}`, { auth: false })
      .then(setShowtimes)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load showtimes"));
  }, [theaterId, selectedDate]);

  const handleDeleteShowtime = async (id: number) => {
    const previous = showtimes;
    setShowtimes((prev) => prev.filter((s) => s.showtime_id !== id));
    try {
      await apiFetch(`/showtimes/${id}`, { method: "DELETE" });
    } catch (err) {
      setShowtimes(previous);
      setError(err instanceof ApiError ? err.message : "Failed to delete screening");
    }
  };

  const shiftDate = (days: number) => {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const dateStr = toDateInputValue(selectedDate);

  return (
    <main className="flex-grow flex flex-col gap-4 px-5 md:px-20 pb-24 md:pb-8 max-w-[1920px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <Link href="/admin/branches" className="text-sm font-semibold flex items-center gap-1 transition-colors" style={{ color: "#e9bcb6" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          All branches
        </Link>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Link
            href={`/admin/branches/${theaterId}/screens/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale flex-1 md:flex-none justify-center"
            style={glassStyle()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chair</span>
            Add Screen
          </Link>
          <Link
            href={`/admin/branches/${theaterId}/schedule/new?date=${dateStr}`}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale w-full md:w-auto justify-center"
            style={{
              background: "#e50914",
              boxShadow: "0 0 15px rgba(229,9,20,0.4)",
              opacity: theater?.screens?.length ? 1 : 0.5,
              pointerEvents: theater?.screens?.length ? "auto" : "none",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            New Screening
          </Link>
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: "#ff8a80" }}>{error}</p>}

      <div className="rounded-xl p-2 flex flex-col md:flex-row gap-4 items-center justify-between" style={glassStyle()}>
        <div className="flex items-center gap-2 px-3">
          <span className="material-symbols-outlined" style={{ color: "#ffb4aa" }}>storefront</span>
          <span className="text-sm font-semibold text-white">{theater?.theater_name ?? "..."}</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1c1b1b", border: "1px solid #201f1f" }}>
          <button onClick={() => shiftDate(-1)} style={{ color: "#e9bcb6" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
          </button>
          <span className="text-sm font-semibold text-white px-2">
            {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <button onClick={() => shiftDate(1)} style={{ color: "#e9bcb6" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
          </button>
          <button className="ml-2" style={{ color: "#ffb4aa" }} onClick={() => setSelectedDate(new Date())}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-0 flex-grow" style={{ minHeight: 500 }}>
        <div className="flex w-full sticky top-0 z-20" style={glassStyle({ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 })}>
          <div className="flex-shrink-0 flex items-center justify-center p-4" style={{ width: 96, borderRight: "1px solid rgba(255,255,255,0.05)", background: "rgba(32,31,31,0.50)" }}>
            <span className="uppercase tracking-widest text-xs font-medium" style={{ color: "#e9bcb6" }}>Screen</span>
          </div>
          <div className="flex-grow overflow-x-hidden">
            <div className="flex w-full" style={{ minWidth: 800 }}>
              {HOURS.map((h, i) => (
                <div key={h} className="flex-1 p-2 text-center text-xs font-medium" style={{ borderRight: i < HOURS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", color: "#e9bcb6" }}>
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex flex-col flex-grow overflow-hidden relative"
          style={{
            ...glassStyle({ borderTopLeftRadius: 0, borderTopRightRadius: 0 }),
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 100%",
          }}
        >
          {loading && <p className="p-6 text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>}

          {!loading && theater && theater.screens.length === 0 && (
            <div className="p-6 flex flex-col items-center gap-2">
              <p className="text-sm" style={{ color: "#e9bcb6" }}>This branch has no screens yet.</p>
              <Link href={`/admin/branches/${theaterId}/screens/new`} className="text-sm font-semibold" style={{ color: "#ffb4aa" }}>Add the first screen</Link>
            </div>
          )}

          {theater?.screens?.map((screen: any) => (
            <ScreenRow
              key={screen.screen_id}
              screen={screen}
              showtimes={showtimes.filter((s) => s.screen_id === screen.screen_id)}
              onDelete={handleDeleteShowtime}
              onScheduleHere={(screenId) => {
                router.push(`/admin/branches/${theaterId}/schedule/new?date=${dateStr}&screenId=${screenId}`);
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
