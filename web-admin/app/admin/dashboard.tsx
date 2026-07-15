"use client";

import { useEffect, useState } from "react";
import { useAdminHeader } from "./components/AdminHeaderContext";
import { apiFetch } from "@/lib/api";

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  trend: "up" | "down";
  trendValue: string;
  highlight?: boolean;
}

interface Booking {
  title: string;
  customer: string;
  tickets: number;
  price: string;
  time: string;
  badge: string;
}

interface SystemService {
  name: string;
  status: "Operational" | "Degraded";
  statusDetail?: string;
  pct: number;
}


interface ApiBooking {
  booking_id: number;
  total: string;
}
interface ApiUser {
  user_id: number;
}
interface ApiShowtime {
  showtime_id: number;
  seats_remaining: number;
  screen: { total_seats: number };
}

async function fetchKpiCards(): Promise<KpiCard[]> {
  const [bookings, users, showtimes] = await Promise.all([
    apiFetch<ApiBooking[]>("/bookings"),
    apiFetch<ApiUser[]>("/users"),
    apiFetch<ApiShowtime[]>("/showtimes", { auth: false }),
  ]);

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const totalSeats = showtimes.reduce((sum, s) => sum + s.screen.total_seats, 0);
  const bookedSeats = showtimes.reduce((sum, s) => sum + (s.screen.total_seats - s.seats_remaining), 0);
  const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  return [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: "payments", trend: "up", trendValue: "Live" },
    { label: "Active Bookings", value: bookings.length.toLocaleString(), icon: "confirmation_number", trend: "up", trendValue: "Live", highlight: true },
    { label: "Total Users", value: users.length.toLocaleString(), icon: "person_add", trend: "up", trendValue: "Live" },
    { label: "Occupancy Rate", value: `${occupancy}%`, icon: "event_seat", trend: "up", trendValue: "Live" },
  ];
}

const EMPTY_KPI_CARDS: KpiCard[] = [
  { label: "Total Revenue", value: "—", icon: "payments", trend: "up", trendValue: "" },
  { label: "Active Bookings", value: "—", icon: "confirmation_number", trend: "up", trendValue: "", highlight: true },
  { label: "Total Users", value: "—", icon: "person_add", trend: "up", trendValue: "" },
  { label: "Occupancy Rate", value: "—", icon: "event_seat", trend: "up", trendValue: "" },
];

const RECENT_BOOKINGS: Booking[] = [
  { title: "Dune: Part Two",  customer: "Sarah Jenkins", tickets: 2, price: "$48.00",  time: "Just now", badge: "IMAX" },
  { title: "The Batman",      customer: "Mike Ross",     tickets: 4, price: "$82.00",  time: "5m ago",   badge: "3D" },
  { title: "Oppenheimer",     customer: "Elena Gilbert", tickets: 1, price: "$25.00",  time: "12m ago",  badge: "VIP" },
  { title: "Poor Things",     customer: "David Chen",    tickets: 2, price: "$38.00",  time: "24m ago",  badge: "STD" },
];

const SYSTEM_SERVICES: SystemService[] = [
  { name: "Payment Gateway", status: "Operational",                  pct: 100 },
  { name: "Ticketing API",   status: "Operational",                  pct: 100 },
  { name: "Kiosk Sync",      status: "Degraded", statusDetail: "(15ms delay)", pct: 85 },
];


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

function KpiCardItem({ card }: { card: KpiCard }) {
  return (
    <GlassPanel
      className="p-6 flex flex-col relative overflow-hidden group"
      style={
        card.highlight
          ? { boxShadow: "0 0 15px rgba(229,9,20,0.4)", borderColor: "rgba(229,9,20,0.30)" }
          : {}
      }
    >
      {/* decorative bg icon */}
      <span
        className="material-symbols-outlined absolute top-0 right-0 p-4 opacity-10 translate-x-2 -translate-y-2 text-6xl group-hover:scale-110 transition-transform duration-500 select-none"
        style={{ color: "#e50914" }}
      >
        {card.icon}
      </span>

      <div className="flex justify-between items-start mb-4">
        <p
          className="font-semibold text-xs uppercase tracking-widest"
          style={{
            color: card.highlight ? "#ffb4aa" : "#e9bcb6",
            textShadow: card.highlight ? "0 0 15px rgba(229,9,20,0.4)" : undefined,
          }}
        >
          {card.label}
        </p>
        <span
          className="material-symbols-outlined"
          style={{ color: "#e50914", fontVariationSettings: card.highlight ? "'FILL' 1" : undefined }}
        >
          {card.icon}
        </span>
      </div>

      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{card.value}</h3>

      <div className="flex items-center mt-auto">
        {card.trendValue ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ background: "#22c55e" }} />
            <span className="text-xs" style={{ color: "#e9bcb6" }}>Live from database</span>
          </>
        ) : (
          <span className="text-xs" style={{ color: "#8a8887" }}>Loading…</span>
        )}
      </div>
    </GlassPanel>
  );
}


const CHART_POINTS = [
  { x: 0,   y: 180 },
  { x: 100, y: 150 },
  { x: 200, y: 190 },
  { x: 300, y: 120 },
  { x: 400, y: 140 },
  { x: 500, y: 80  },
  { x: 600, y: 110 },
  { x: 700, y: 50  },
  { x: 800, y: 70  },
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LINE = CHART_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
const AREA = `M0,250 L0,180 ${CHART_POINTS.slice(1).map(p => `L${p.x},${p.y}`).join(" ")} L800,250 Z`;

type Period = "7D" | "30D" | "90D";

function RevenueChart() {
  const [period, setPeriod] = useState<Period>("30D");

  return (
    <GlassPanel className="lg:col-span-2 p-6 flex flex-col" style={{ height: 400 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Weekly Revenue</h2>
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

      <div className="flex-1 relative">
        <svg viewBox="0 0 800 250" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="#e50914" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e50914" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {[50, 100, 150, 200].map((y) => (
            <line key={y} x1={0} x2={800} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          ))}
          <path d={AREA}  fill="url(#chart-gradient)" opacity={0.2} />
          <path d={LINE}  stroke="#e50914" strokeWidth={3} fill="none" />
          {CHART_POINTS.slice(1, -1).map((p) => (
            <circle key={p.x} cx={p.x} cy={p.y} r={5} fill="#e50914" stroke="#131313" strokeWidth={2} />
          ))}
        </svg>

        <div
          className="absolute left-0 w-full flex justify-between px-2 text-xs"
          style={{ bottom: -24, color: "#e9bcb6" }}
        >
          {DAYS.map((d) => <span key={d}>{d}</span>)}
        </div>
      </div>
    </GlassPanel>
  );
}


function BookingItem({ booking }: { booking: Booking }) {
  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 cursor-pointer group"
      style={{ borderLeft: "2px solid transparent" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(53,53,52,0.30)";
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = "#e50914";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = "transparent";
      }}
    >
      {/* poster placeholder */}
      <div
        className="w-12 h-16 rounded overflow-hidden flex-shrink-0 relative"
        style={{ background: "#2a2a2a" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-1 right-1 text-white font-bold" style={{ fontSize: 10 }}>
          {booking.badge}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">{booking.title}</h4>
        <p className="text-xs truncate" style={{ color: "#e9bcb6" }}>
          {booking.customer} • {booking.tickets} Ticket{booking.tickets > 1 ? "s" : ""}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold" style={{ color: "#ffb4aa" }}>{booking.price}</p>
        <p className="text-xs" style={{ color: "#e9bcb6" }}>{booking.time}</p>
      </div>
    </div>
  );
}

function RecentBookings() {
  return (
    <GlassPanel className="flex flex-col" style={{ height: 400 }}>
      <div
        className="p-6 pb-4 flex justify-between items-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
        <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffb4aa" }}>
          View All
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {RECENT_BOOKINGS.map((b) => (
          <BookingItem key={b.title + b.time} booking={b} />
        ))}
      </div>
    </GlassPanel>
  );
}


function AlertBanner() {
  return (
    <GlassPanel className="p-6 flex flex-col justify-center items-start relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{ background: "linear-gradient(to right, rgba(229,9,20,0.20), transparent)" }}
      />
      <div className="relative z-10">
        <span
          className="inline-block px-2 py-1 rounded text-xs font-bold mb-3 uppercase tracking-wider"
          style={{ background: "rgba(229,9,20,0.30)", border: "1px solid #e50914", color: "#ffb4aa" }}
        >
          Alert
        </span>
        <h3 className="text-xl font-semibold text-white mb-2">High Demand Expected</h3>
        <p className="text-sm mb-4 max-w-sm" style={{ color: "#e9bcb6" }}>
          "Interstellar" re-release opens tomorrow. Occupancy for evening shows is already at 92%.
          Consider opening additional screens.
        </p>
        <button
          className="font-semibold text-sm py-2 px-4 rounded-lg text-white transition-colors duration-200"
          style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.4)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#c0000c")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#e50914")}
        >
          Manage Schedule
        </button>
      </div>
      <span
        className="material-symbols-outlined absolute right-4 bottom-4 select-none"
        style={{ fontSize: 96, color: "rgba(255,255,255,0.05)", transform: "rotate(12deg)" }}
      >
        local_fire_department
      </span>
    </GlassPanel>
  );
}


function SystemStatus() {
  return (
    <GlassPanel className="p-6 flex flex-col justify-center">
      <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
      <div className="space-y-4">
        {SYSTEM_SERVICES.map((svc) => {
          const isOk = svc.status === "Operational";
          const barColor = isOk ? "#22c55e" : "#eab308";
          const textColor = isOk ? "#22c55e" : "#eab308";
          return (
            <div key={svc.name}>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span style={{ color: "#e9bcb6" }}>{svc.name}</span>
                <span style={{ color: textColor }}>
                  {svc.status}{svc.statusDetail ? ` ${svc.statusDetail}` : ""}
                </span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#353534" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${svc.pct}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}


export default function CinePremiumDashboard() {
  const [kpiCards, setKpiCards] = useState<KpiCard[]>(EMPTY_KPI_CARDS);
  useAdminHeader("Dashboard Overview", "Welcome back, Alex. Here's what's happening today.");

  useEffect(() => {
    fetchKpiCards()
      .then(setKpiCards)
      .catch(() => {});
  }, []);

  return (
    <div className="px-5 md:px-20 pb-8 space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KpiCardItem key={card.label} card={card} />
        ))}
      </div>

      {/* Chart + Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart />
        <RecentBookings />
      </div>

      {/* Alert + System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
        <AlertBanner />
        <SystemStatus />
      </div>
    </div>
  );
}