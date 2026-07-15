"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminHeader } from "../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { glassStyle, type Genre } from "./shared";

export default function GenreList() {
  useAdminHeader("Genres", "Manage the genre catalog used to classify movies.");

  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<Genre[]>("/genres", { auth: false })
      .then(setGenres)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load genres"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this genre? This can't be undone.")) return;
    const previous = genres;
    setGenres((prev) => prev.filter((g) => g.genre_id !== id));
    try {
      await apiFetch(`/genres/${id}`, { method: "DELETE" });
    } catch (err) {
      setGenres(previous);
      setError(err instanceof ApiError ? err.message : "Failed to delete genre");
    }
  };

  const filtered = genres.filter((g) => search === "" || g.genre_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 20, color: "#e9bcb6" }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search genres..."
              className="w-full rounded-lg pl-10 pr-4 py-2 text-base text-white transition-colors outline-none"
              style={{ background: "#201f1f", border: "1px solid #5e3f3b", caretColor: "#ffb4aa" }}
            />
          </div>
          <Link
            href="/admin/genres/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale"
            style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.30)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            <span className="hidden sm:inline">Add Genre</span>
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {loading && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading genres...</p>}
      {!loading && filtered.length === 0 && <p className="text-sm" style={{ color: "#e9bcb6" }}>No genres found.</p>}

      <div className="rounded-xl overflow-hidden" style={glassStyle()}>
        {filtered.map((g, i) => (
          <div
            key={g.genre_id}
            className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/5"
            style={i !== filtered.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : undefined}
          >
            <span className="text-sm font-medium text-white">{g.genre_name}</span>
            <div className="flex gap-2">
              <Link
                href={`/admin/genres/${g.genre_id}/edit`}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "#e9bcb6" }}
                title="Edit genre"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
              </Link>
              <button
                onClick={() => handleDelete(g.genre_id)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "#ff8a80" }}
                title="Delete genre"
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
