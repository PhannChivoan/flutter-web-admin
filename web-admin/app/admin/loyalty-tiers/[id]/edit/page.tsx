"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoyaltyTierForm from "../../LoyaltyTierForm";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { type LoyaltyTier } from "../../shared";

export default function EditLoyaltyTierPage() {
  const params = useParams();
  const id = Number(params.id);
  useAdminHeader("Edit Loyalty Tier", "Update this tier's name, threshold, and progression.");

  const [tier, setTier] = useState<LoyaltyTier | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<LoyaltyTier>(`/loyalty-tiers/${id}`, { auth: false }),
      apiFetch<LoyaltyTier[]>("/loyalty-tiers", { auth: false }),
    ])
      .then(([t, all]) => {
        setTier(t);
        setTiers(all);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loyalty tier"));
  }, [id]);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {tier ? <LoyaltyTierForm tiers={tiers} editing={tier} /> : !error && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>}
    </main>
  );
}
