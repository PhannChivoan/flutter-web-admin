"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { inputStyle, glassStyle, type LoyaltyTier } from "./shared";

export default function LoyaltyTierForm({ tiers, editing }: { tiers: LoyaltyTier[]; editing?: LoyaltyTier }) {
  const router = useRouter();
  const [tierName, setTierName] = useState(editing?.tier_name ?? "");
  const [minPoints, setMinPoints] = useState(String(editing?.min_points ?? 0));
  const [nextTierId, setNextTierId] = useState<number | "">(editing?.next_tier_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const options = tiers.filter((t) => t.tier_id !== editing?.tier_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        tier_name: tierName,
        min_points: Number(minPoints) || 0,
        next_tier_id: nextTierId ? Number(nextTierId) : null,
      };
      if (editing) {
        await apiFetch<LoyaltyTier>(`/loyalty-tiers/${editing.tier_id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch<LoyaltyTier>("/loyalty-tiers", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/loyalty-tiers");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save loyalty tier");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Tier name</label>
          <input required value={tierName} onChange={(e) => setTierName(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Minimum points</label>
          <input type="number" min={0} value={minPoints} onChange={(e) => setMinPoints(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Next tier (progression)</label>
          <select value={nextTierId} onChange={(e) => setNextTierId(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle}>
            <option value="">None</option>
            {options.map((t) => (
              <option key={t.tier_id} value={t.tier_id}>{t.tier_name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

      <div className="flex justify-end gap-2 pb-8">
        <button type="button" onClick={() => router.push("/admin/loyalty-tiers")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : editing ? "Save Changes" : "Add Tier"}
        </button>
      </div>
    </form>
  );
}
