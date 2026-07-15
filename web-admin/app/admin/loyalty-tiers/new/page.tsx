"use client";

import { useEffect, useState } from "react";
import LoyaltyTierForm from "../LoyaltyTierForm";
import { useAdminHeader } from "../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { type LoyaltyTier } from "../shared";

export default function NewLoyaltyTierPage() {
  useAdminHeader("Add Loyalty Tier", "Create a new loyalty tier and point threshold.");
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<LoyaltyTier[]>("/loyalty-tiers", { auth: false })
      .then(setTiers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load loyalty tiers"));
  }, []);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      <LoyaltyTierForm tiers={tiers} />
    </main>
  );
}
