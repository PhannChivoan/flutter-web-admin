"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminHeader } from "./components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";

interface MetricCard {
  label: string;
  value: string;
  icon: string;
}

interface ApiBooking {
  booking_id: number;
  ticket_qty: number;
  total: string;
  booked_at: string;
  showtime: { movie: { title: string } };
}

interface ApiShowtime {
  showtime_id: number;
  seats_remaining: number;
  screen: { total_seats: number };
}

interface ApiUser {
  user_id: number;
}

function GlassPanel({ children, className = "", style = {} }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{
        background: "rgba(26,26,26,0.70)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.10)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MetricCardItem({ metric }: { metric: MetricCard }) {
  return (
    <GlassPanel className="p-6 flex flex-col relative overflow-hidden group">
      <span
        className="material-symbols-outlined absolute top-0 right-0 p-4 opacity-10 translate-x-2 -translate-y-2 text-6xl group-hover:scale-110 transition-transform duration-500 select-none"
        style={{ color: "#e50914" }}
      >
        {metric.icon}
      </span>
      <p className="font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "#e9bcb6" }}>
        {metric.label}
      </p>
      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{metric.value}</h3>
      <div className="flex items-center mt-auto">
        <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ background: "#22c55e" }} />
        <span className="text-xs" style={{ color: "#e9bcb6" }}>Live from database</span>
      </div>
    </GlassPanel>
  );
}

type Period = "7D" | "30D" | "90D";

function bucketBookings(bookings: ApiBooking[], period: Period) {
  const now = new Date();
  const days = period === "7D" ? 7 : period === "30D" ? 30 : 90;
  const bucketCount = period === "7D" ? 7 : period === "30D" ? 5 : 6;
  const bucketDays = Math.ceil(days / bucketCount);

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const end = new Date(now);
    end.setDate(end.getDate() - (bucketCount - 1 - i) * bucketDays);
    const start = new Date(end);
    start.setDate(start.getDate() - bucketDays + 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, value: 0 };
  });

  for (const b of bookings) {
    const t = new Date(b.booked_at).getTime();
    const bucket = buckets.find((bk) => t >= bk.start.getTime() && t <= bk.end.getTime());
    if (bucket) bucket.value += b.ticket_qty;
  }

  return buckets.map((bk) => ({
    label:
      period === "7D"
        ? bk.end.toLocaleDateString("en-US", { weekday: "short" })
        : bk.end.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: bk.value,
  }));
}

function WeeklySalesChart({ bookings }: { bookings: ApiBooking[] }) {
  const [period, setPeriod] = useState<Period>("7D");
  const data = useMemo(() => bucketBookings(bookings, period), [bookings, period]);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <GlassPanel className="lg:col-span-2 p-6 flex flex-col" style={{ height: 360 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Ticket Sales</h2>
        <div className="flex gap-2">
          {(["7D", "30D", "90D"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-200"
              style={
                period === p
                  ? { background: "#e50914", color: "#fff", boxShadow: "0 0 10px rgba(229,9,20,0.4)" }
                  : { background: "rgba(53,53,52,0.5)", color: "#e9bcb6" }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-end gap-4 px-2">
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value > 0 ? 4 : 0,
                background: d.value === max && max > 0 ? "#e50914" : "rgba(229,9,20,0.35)",
                boxShadow: d.value === max && max > 0 ? "0 0 15px rgba(229,9,20,0.5)" : "none",
              }}
            />
            <span className="text-xs" style={{ color: "#e9bcb6" }}>{d.label}</span>
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="text-sm w-full text-center" style={{ color: "#8a8887" }}>No bookings yet</p>
        )}
      </div>
    </GlassPanel>
  );
}

function TopMoviesPanel({ bookings }: { bookings: ApiBooking[] }) {
  const topMovies = useMemo(() => {
    const byMovie = new Map<string, { revenue: number; tickets: number }>();
    for (const b of bookings) {
      const title = b.showtime.movie.title;
      const entry = byMovie.get(title) ?? { revenue: 0, tickets: 0 };
      entry.revenue += Number(b.total);
      entry.tickets += b.ticket_qty;
      byMovie.set(title, entry);
    }
    const list = [...byMovie.entries()]
      .map(([title, v]) => ({ title, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    const max = Math.max(1, ...list.map((m) => m.revenue));
    return list.map((m) => ({ ...m, share: Math.round((m.revenue / max) * 100) }));
  }, [bookings]);

  return (
    <GlassPanel className="flex flex-col" style={{ height: 360 }}>
      <div className="p-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 className="text-xl font-semibold text-white">Top Performing Movies</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {topMovies.length === 0 && (
          <p className="text-sm" style={{ color: "#8a8887" }}>No bookings yet.</p>
        )}
        {topMovies.map((m, i) => (
          <div key={m.title}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-semibold text-white">
                {i + 1}. {m.title}
              </span>
              <span className="text-xs font-semibold" style={{ color: "#ffb4aa" }}>
                ${m.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "#353534" }}>
              <div className="h-full rounded-full" style={{ width: `${m.share}%`, background: "#e50914" }} />
            </div>
            <p className="text-xs" style={{ color: "#8a8887" }}>{m.tickets.toLocaleString()} tickets</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export default function Analytics() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([
    { label: "Total Revenue", value: "—", icon: "payments" },
    { label: "Tickets Sold", value: "—", icon: "confirmation_number" },
    { label: "Avg. Occupancy", value: "—", icon: "event_seat" },
    { label: "Total Members", value: "—", icon: "person_add" },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<ApiBooking[]>("/bookings"),
      apiFetch<ApiShowtime[]>("/showtimes", { auth: false }),
      apiFetch<ApiUser[]>("/users"),
    ])
      .then(([b, showtimes, users]) => {
        setBookings(b);

        const totalRevenue = b.reduce((sum, x) => sum + Number(x.total), 0);
        const ticketsSold = b.reduce((sum, x) => sum + x.ticket_qty, 0);
        const totalSeats = showtimes.reduce((sum, s) => sum + s.screen.total_seats, 0);
        const bookedSeats = showtimes.reduce((sum, s) => sum + (s.screen.total_seats - s.seats_remaining), 0);
        const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

        setMetrics([
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: "payments" },
          { label: "Tickets Sold", value: ticketsSold.toLocaleString(), icon: "confirmation_number" },
          { label: "Avg. Occupancy", value: `${occupancy}%`, icon: "event_seat" },
          { label: "Total Members", value: users.length.toLocaleString(), icon: "person_add" },
        ]);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load analytics"));
  }, []);

  useAdminHeader("Analytics", "Performance insights across revenue, sales, and audience trends.");

  return (
    <div className="px-5 md:px-20 pb-8 space-y-4">
      {error && <p className="text-sm" style={{ color: "#ff8a80" }}>{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCardItem key={m.label} metric={m} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WeeklySalesChart bookings={bookings} />
        <TopMoviesPanel bookings={bookings} />
      </div>
    </div>
  );
}
