"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminHeader } from "../components/AdminHeaderContext";
import { apiFetch, apiUrl, ApiError } from "@/lib/api";
import { glassStyle, type Theater } from "./shared";

export default function BranchList() {
  useAdminHeader("Branches", "Manage cinema locations, their screens, and showtime schedules.");

  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Theater[]>("/theaters", { auth: false })
      .then(setTheaters)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load branches"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this branch? This can't be undone.")) return;
    const previous = theaters;
    setTheaters((prev) => prev.filter((t) => t.theater_id !== id));
    try {
      await apiFetch(`/theaters/${id}`, { method: "DELETE" });
    } catch (err) {
      setTheaters(previous);
      setError(err instanceof ApiError ? err.message : "Failed to delete branch");
    }
  };

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-end mb-6">
        <Link
          href="/admin/branches/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover-scale"
          style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.30)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_business</span>
          Add Branch
        </Link>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {loading && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading branches...</p>}
      {!loading && theaters.length === 0 && (
        <p className="text-sm" style={{ color: "#e9bcb6" }}>No branches yet — add one to get started.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {theaters.map((t) => {
          const img = apiUrl(t.image_url);
          return (
            <div key={t.theater_id} className="rounded-xl overflow-hidden hover-lift" style={glassStyle()}>
              <div className="h-36 relative flex items-center justify-center" style={{ background: "#201f1f" }}>
                {img ? (
                  <img src={img} alt={t.theater_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#5e3f3b" }}>storefront</span>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Link
                    href={`/admin/branches/${t.theater_id}/edit`}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#e9bcb6" }}
                    title="Edit branch"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(t.theater_id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#ff8a80" }}
                    title="Delete branch"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="text-base font-semibold text-white">{t.theater_name}</h3>
                <p className="text-xs" style={{ color: "#e9bcb6" }}>{t.address}, {t.city}, {t.state} {t.zip}</p>
                <p className="text-xs" style={{ color: "#8a8887" }}>{t.screens.length} screen{t.screens.length === 1 ? "" : "s"}</p>
                <Link
                  href={`/admin/branches/${t.theater_id}/schedule`}
                  className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_month</span>
                  Manage Schedule
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
