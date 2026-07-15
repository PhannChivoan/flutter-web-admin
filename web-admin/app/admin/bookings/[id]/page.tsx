"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminHeader } from "../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { glassStyle, inputStyle, formatDateTime, formatCurrency, type Booking } from "../shared";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  useAdminHeader("Booking Detail", "View the full order, seats, and payment info.");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Booking>(`/bookings/${id}`)
      .then(setBooking)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load booking"));
  }, [id]);

  if (error) return <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full"><p className="text-sm" style={{ color: "#ff8a80" }}>{error}</p></main>;
  if (!booking) return <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full"><p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p></main>;

  const rows: [string, string][] = [
    ["Order number", booking.order_number],
    ["QR code", booking.qr_code],
    ["Booked at", formatDateTime(booking.booked_at)],
    ["Customer", `${booking.user.full_name} (${booking.user.email})`],
    ["Show date", new Date(booking.showtime.show_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
    ["Availability", booking.showtime.availability],
    ["Seats", booking.seats.map((s) => s.seat_label).join(", ") || "—"],
    ["Ticket qty", String(booking.ticket_qty)],
    ["Payment method", `${booking.payment_method.payment_type}${booking.payment_method.card_last4 ? ` •••• ${booking.payment_method.card_last4}` : ""}`],
    ["Promo code", booking.promo_code ?? "—"],
    ["Subtotal", formatCurrency(booking.ticket_subtotal)],
    ["Convenience fee", formatCurrency(booking.convenience_fee)],
    ["Tax", formatCurrency(booking.tax)],
    ["Total", formatCurrency(booking.total)],
  ];

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <div className="rounded-xl overflow-hidden max-w-2xl" style={glassStyle()}>
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className="flex items-center justify-between px-5 py-3"
            style={i !== rows.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : undefined}
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>{label}</span>
            <span className="text-sm text-white text-right">{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/admin/bookings")}
        className="mt-6 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
        style={{ ...inputStyle, background: "rgba(255,255,255,0.08)" }}
      >
        Back to bookings
      </button>
    </main>
  );
}
