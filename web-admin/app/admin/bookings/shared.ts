import type { CSSProperties } from "react";

export interface BookingUser {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  loyalty_tier_id: number;
  loyalty_points: number;
  created_at: string;
}

export interface BookingShowtime {
  showtime_id: number;
  movie_id: number;
  screen_id: number;
  show_date: string;
  show_time: string;
  availability: string;
  seats_remaining: number;
  ticket_price: string;
}

export interface BookingPaymentMethod {
  payment_id: number;
  payment_type: string;
  card_last4: string | null;
  is_default: boolean;
}

export interface BookingSeat {
  seat_id: number;
  booking_id: number;
  showtime_id: number;
  seat_label: string;
}

export interface Booking {
  booking_id: number;
  order_number: string;
  qr_code: string;
  user_id: number;
  showtime_id: number;
  payment_id: number;
  ticket_qty: number;
  ticket_subtotal: string;
  convenience_fee: string;
  tax: string;
  total: string;
  promo_code: string | null;
  booked_at: string;
  user: BookingUser;
  showtime: BookingShowtime;
  payment_method: BookingPaymentMethod;
  seats: BookingSeat[];
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatCurrency(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : value;
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
