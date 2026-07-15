"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, apiUpload, apiUrl, ApiError } from "@/lib/api";
import MediaField, { type MediaMode } from "./MediaField";
import { inputStyle, glassStyle, toDateInputValue, type ApiMovie, type ApiMovieStatus, type Genre, type CastEntry } from "./shared";
import { type Actor } from "../actors/shared";

interface SelectedActor {
  actor_id: number;
  character_name: string;
}

export default function MovieForm({
  genres,
  actors,
  editing,
  editingCast,
}: {
  genres: Genre[];
  actors: Actor[];
  editing?: ApiMovie;
  editingCast?: CastEntry[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [genreId, setGenreId] = useState<number | "">(editing?.genre_id ?? genres[0]?.genre_id ?? "");
  const [contentRating, setContentRating] = useState(editing?.content_rating ?? "PG-13");
  const [durationMin, setDurationMin] = useState(String(editing?.duration_min ?? 120));
  const [releaseDate, setReleaseDate] = useState(toDateInputValue(editing?.release_date ?? null));
  const [status, setStatus] = useState<ApiMovieStatus>(editing?.status ?? "COMING_SOON");
  const [synopsis, setSynopsis] = useState(editing?.synopsis ?? "");

  const [posterMode, setPosterMode] = useState<MediaMode>("url");
  const [posterUrl, setPosterUrl] = useState(editing?.poster_url ?? "");
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const [trailerMode, setTrailerMode] = useState<MediaMode>("url");
  const [trailerUrl, setTrailerUrl] = useState(editing?.trailer_url ?? "");
  const [trailerFile, setTrailerFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedActors, setSelectedActors] = useState<SelectedActor[]>(
    (editingCast ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ actor_id: c.actor_id, character_name: c.character_name }))
  );

  const toggleActor = (actorId: number) => {
    setSelectedActors((prev) =>
      prev.some((a) => a.actor_id === actorId)
        ? prev.filter((a) => a.actor_id !== actorId)
        : [...prev, { actor_id: actorId, character_name: "" }]
    );
  };

  const setCharacterName = (actorId: number, name: string) => {
    setSelectedActors((prev) => prev.map((a) => (a.actor_id === actorId ? { ...a, character_name: name } : a)));
  };

  const syncCast = async (movieId: number) => {
    const original = editingCast ?? [];
    const removed = original.filter((c) => !selectedActors.some((a) => a.actor_id === c.actor_id));
    await Promise.all(removed.map((c) => apiFetch(`/cast/${c.cast_id}`, { method: "DELETE" })));

    await Promise.all(
      selectedActors.map((a, index) => {
        const existing = original.find((c) => c.actor_id === a.actor_id);
        const position = index + 1;
        if (existing) {
          if (existing.character_name === a.character_name && existing.position === position) return null;
          return apiFetch(`/cast/${existing.cast_id}`, {
            method: "PUT",
            body: JSON.stringify({ actor_id: a.actor_id, character_name: a.character_name, position }),
          });
        }
        return apiFetch("/cast", {
          method: "POST",
          body: JSON.stringify({ movie_id: movieId, actor_id: a.actor_id, character_name: a.character_name, position }),
        });
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title,
        genre_id: genreId ? Number(genreId) : null,
        content_rating: contentRating,
        duration_min: Number(durationMin) || null,
        release_date: releaseDate || null,
        status,
        synopsis: synopsis || null,
        ...(posterMode === "url" ? { poster_url: posterUrl || null } : {}),
        ...(trailerMode === "url" ? { trailer_url: trailerUrl || null } : {}),
      };

      let movie = editing
        ? await apiFetch<ApiMovie>(`/movies/${editing.movie_id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiFetch<ApiMovie>("/movies", { method: "POST", body: JSON.stringify(payload) });

      if (posterMode === "upload" && posterFile) {
        movie = await apiUpload<ApiMovie>(`/movies/${movie.movie_id}/poster`, posterFile);
      }
      if (trailerMode === "upload" && trailerFile) {
        movie = await apiUpload<ApiMovie>(`/movies/${movie.movie_id}/trailer`, trailerFile);
      }

      await syncCast(movie.movie_id);

      router.push("/admin/movies");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save movie");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl flex flex-col gap-4">
      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Genre</label>
            <select value={genreId} onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle}>
              {genres.map((g) => (
                <option key={g.genre_id} value={g.genre_id}>{g.genre_name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Rating</label>
            <input value={contentRating} onChange={(e) => setContentRating(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Duration (min)</label>
            <input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Release Date</label>
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ApiMovieStatus)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle}>
            <option value="NOW_SHOWING">Now Playing</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Synopsis</label>
          <textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={3} className="w-full rounded-lg px-4 py-2 text-sm outline-none resize-none" style={inputStyle} />
        </div>
      </div>

      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Cast (Actors)</label>
          <Link href="/admin/actors/new" className="text-xs font-semibold transition-colors" style={{ color: "#ffb4aa" }}>
            + New actor profile
          </Link>
        </div>

        {actors.length === 0 && <p className="text-sm" style={{ color: "#8a8887" }}>No actors available yet.</p>}

        <div className="flex flex-wrap gap-2">
          {actors.map((a) => {
            const isSelected = selectedActors.some((s) => s.actor_id === a.actor_id);
            return (
              <button
                type="button"
                key={a.actor_id}
                onClick={() => toggleActor(a.actor_id)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: isSelected ? "#e50914" : "rgba(255,255,255,0.08)",
                  border: isSelected ? "1px solid #e50914" : "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              >
                {a.name}
              </button>
            );
          })}
        </div>

        {selectedActors.length > 0 && (
          <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            {selectedActors.map((s) => {
              const actor = actors.find((a) => a.actor_id === s.actor_id);
              return (
                <div key={s.actor_id} className="flex items-center gap-3">
                  <span className="text-sm text-white w-32 flex-shrink-0 truncate">{actor?.name ?? s.actor_id}</span>
                  <input
                    value={s.character_name}
                    onChange={(e) => setCharacterName(s.actor_id, e.target.value)}
                    placeholder="Character name"
                    className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => toggleActor(s.actor_id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ color: "#ff8a80" }}
                    title="Remove"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <MediaField
          label="Cover Image"
          accept="image/*"
          kind="image"
          mode={posterMode}
          setMode={setPosterMode}
          urlValue={posterUrl}
          setUrlValue={setPosterUrl}
          file={posterFile}
          setFile={setPosterFile}
          currentUrl={apiUrl(editing?.poster_url) ?? undefined}
        />

        <MediaField
          label="Trailer Video"
          accept="video/*"
          kind="video"
          mode={trailerMode}
          setMode={setTrailerMode}
          urlValue={trailerUrl}
          setUrlValue={setTrailerUrl}
          file={trailerFile}
          setFile={setTrailerFile}
          currentUrl={apiUrl(editing?.trailer_url) ?? undefined}
        />
      </div>

      {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

      <div className="flex justify-end gap-2 pb-8">
        <button type="button" onClick={() => router.push("/admin/movies")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : editing ? "Save Changes" : "Add Movie"}
        </button>
      </div>
    </form>
  );
}
