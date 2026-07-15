"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminHeader } from "../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { glassStyle, type LoyaltyTier } from "./shared";

export default function LoyaltyTierList() {
  useAdminHeader("Loyalty Tiers", "Manage customer loyalty tiers and point thresholds.");

  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<LoyaltyTier[]>("/loyalty-tiers", { auth: false })
      .then(setTiers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loyalty tiers"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this loyalty tier? This can't be undone.")) return;
    const previous = tiers;
    setTiers((prev) => prev.filter((t) => t.tier_id !== id));
    try {
      await apiFetch(`/loyalty-tiers/${id}`, { method: "DELETE" });
    } catch (err) {
      setTiers(previous);
      setError(err instanceof ApiError ? err.message : "Failed to delete loyalty tier");
    }
  };

  const sorted = tiers.slice().sort((a, b) => a.min_points - b.min_points);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-end mb-8">
        <Link
          href="/admin/loyalty-tiers/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale"
          style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.30)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span className="hidden sm:inline">Add Tier</span>
        </Link>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {loading && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading loyalty tiers...</p>}
      {!loading && sorted.length === 0 && <p className="text-sm" style={{ color: "#e9bcb6" }}>No loyalty tiers found.</p>}

      <div className="rounded-xl overflow-hidden" style={glassStyle()}>
        {sorted.map((t, i) => (
          <div
            key={t.tier_id}
            className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/5"
            style={i !== sorted.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : undefined}
          >
            <div>
              <span className="text-sm font-medium text-white">{t.tier_name}</span>
              <p className="text-xs" style={{ color: "#e9bcb6" }}>
                {t.min_points}+ points
                {t.next_tier_id ? ` → ${sorted.find((x) => x.tier_id === t.next_tier_id)?.tier_name ?? "next tier"}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/loyalty-tiers/${t.tier_id}/edit`}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "#e9bcb6" }}
                title="Edit tier"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
              </Link>
              <button
                onClick={() => handleDelete(t.tier_id)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "#ff8a80" }}
                title="Delete tier"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
