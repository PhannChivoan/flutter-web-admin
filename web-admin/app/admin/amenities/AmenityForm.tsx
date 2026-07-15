"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { inputStyle, glassStyle, type Amenity } from "./shared";

export default function AmenityForm({ editing }: { editing?: Amenity }) {
  const router = useRouter();
  const [amenityName, setAmenityName] = useState(editing?.amenity_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { amenity_name: amenityName };
      if (editing) {
        await apiFetch<Amenity>(`/amenities/${editing.amenity_id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch<Amenity>("/amenities", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/amenities");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save amenity");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Amenity name</label>
          <input required value={amenityName} onChange={(e) => setAmenityName(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>
      </div>

      {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

      <div className="flex justify-end gap-2 pb-8">
        <button type="button" onClick={() => router.push("/admin/amenities")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : editing ? "Save Changes" : "Add Amenity"}
        </button>
      </div>
    </form>
  );
}
