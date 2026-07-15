"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminHeader } from "../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { glassStyle, formatDateTime, formatCurrency, type Booking } from "./shared";

export default function BookingList() {
  useAdminHeader("Bookings", "View customer ticket orders and payment status.");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<Booking[]>("/bookings")
      .then((b) => setBookings(b.slice().sort((a, c) => (a.booked_at < c.booked_at ? 1 : -1))))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(
    (b) =>
      search === "" ||
      b.order_number.toLowerCase().includes(search.toLowerCase()) ||
      b.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-end mb-8">
        <div className="relative flex-1 md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 20, color: "#e9bcb6" }}>search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, name, or email..."
            className="w-full rounded-lg pl-10 pr-4 py-2 text-base text-white transition-colors outline-none"
            style={{ background: "#201f1f", border: "1px solid #5e3f3b", caretColor: "#ffb4aa" }}
          />
        </div>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {loading && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading bookings...</p>}
      {!loading && filtered.length === 0 && <p className="text-sm" style={{ color: "#e9bcb6" }}>No bookings found.</p>}

      <div className="rounded-xl overflow-hidden" style={glassStyle()}>
        {filtered.map((b, i) => (
          <Link
            key={b.booking_id}
            href={`/admin/bookings/${b.booking_id}`}
            className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/5"
            style={i !== filtered.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : undefined}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{b.order_number}</p>
              <p className="text-xs truncate" style={{ color: "#e9bcb6" }}>{b.user.full_name} · {b.user.email}</p>
            </div>
            <div className="text-right flex-shrink-0 pl-4">
              <p className="text-sm font-semibold text-white">{formatCurrency(b.total)}</p>
              <p className="text-xs" style={{ color: "#e9bcb6" }}>{formatDateTime(b.booked_at)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
