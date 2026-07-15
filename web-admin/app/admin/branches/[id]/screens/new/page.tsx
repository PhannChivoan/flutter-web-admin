"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminHeader } from "../../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { inputStyle, glassStyle } from "../../../shared";

export default function NewScreenPage() {
  const params = useParams();
  const router = useRouter();
  const theaterId = Number(params.id);
  useAdminHeader("Add Screen", "Add a new auditorium to this branch.");

  const [name, setName] = useState("Screen");
  const [format, setFormat] = useState<"STANDARD" | "IMAX" | "IMAX_LASER" | "DOLBY_CINEMA">("STANDARD");
  const [totalSeats, setTotalSeats] = useState("80");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/screens", {
        method: "POST",
        body: JSON.stringify({ theater_id: theaterId, screen_name: name, format_type: format, total_seats: Number(totalSeats) }),
      });
      router.push(`/admin/branches/${theaterId}/schedule`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add screen");
      setSaving(false);
    }
  };

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <form onSubmit={handleSubmit} className="max-w-md rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Screen name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle}>
            <option value="STANDARD">Standard</option>
            <option value="IMAX">IMAX</option>
            <option value="IMAX_LASER">IMAX Laser</option>
            <option value="DOLBY_CINEMA">Dolby Cinema</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Total seats</label>
          <input required type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>
        {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Add Screen"}</button>
        </div>
      </form>
    </main>
  );
}
