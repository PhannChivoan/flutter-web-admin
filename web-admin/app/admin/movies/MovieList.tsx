"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminHeader } from "../components/AdminHeaderContext";
import { apiFetch, apiUrl, ApiError } from "@/lib/api";
import {
  ApiMovie,
  Genre,
  Filter,
  FILTERS,
  STATUS_LABEL,
  STATUS_CONFIG,
  RATING_RED,
  formatDuration,
  formatDate,
} from "./shared";

function StatusBadge({ status }: { status: (typeof STATUS_LABEL)[keyof typeof STATUS_LABEL] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: cfg.color }}>
      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.shadow}` }} />
      {status}
    </span>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const isRed = RATING_RED.has(rating);
  return (
    <span
      className="px-2 py-1 rounded text-sm font-semibold"
      style={{ border: `1px solid ${isRed ? "rgba(229,9,20,0.50)" : "#5e3f3b"}`, color: isRed ? "#e50914" : "#e5e2e1" }}
    >
      {rating}
    </span>
  );
}

function ActionBtn({ icon, hoverColor, title, href, onClick }: { icon: string; hoverColor: string; title: string; href?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const style = {
    background: "#201f1f",
    border: `1px solid ${hovered ? hoverColor : "transparent"}`,
    color: hovered ? hoverColor : "#e9bcb6",
  };
  const className = "w-8 h-8 rounded flex items-center justify-center transition-all duration-150";
  const inner = <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>;

  if (href) {
    return (
      <Link href={href} title={title} className={className} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {inner}
      </Link>
    );
  }
  return (
    <button title={title} onClick={onClick} className={className} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {inner}
    </button>
  );
}

function MovieRow({ movie, onDelete }: { movie: ApiMovie; onDelete: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_LABEL[movie.status];
  const poster = apiUrl(movie.poster_url);

  return (
    <tr
      className="transition-colors duration-150"
      style={{ background: hovered ? "rgba(255,255,255,0.03)" : "transparent", boxShadow: hovered ? "inset 2px 0 0 0 #e50914" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="p-4">
        <div className="w-10 h-14 rounded overflow-hidden flex items-center justify-center transition-transform duration-200" style={{ background: "#353534", transform: hovered ? "scale(1.05)" : "none" }}>
          {poster ? (
            <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined" style={{ color: "#e9bcb6", fontSize: 18 }}>movie</span>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="text-base font-semibold text-white">{movie.title}</div>
          {movie.trailer_url && (
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#ffb4aa" }} title="Has trailer">play_circle</span>
          )}
        </div>
        {movie.genre && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.10)", color: "#e9bcb6" }}>{movie.genre.genre_name}</span>
        )}
      </td>

      <td className="p-4"><StatusBadge status={status} /></td>
      <td className="p-4 text-sm" style={{ color: "#e9bcb6" }}>{formatDate(movie.release_date)}</td>
      <td className="p-4 text-sm" style={{ color: "#e9bcb6" }}>{formatDuration(movie.duration_min)}</td>
      <td className="p-4"><RatingBadge rating={movie.content_rating ?? "NR"} /></td>

      <td className="p-4 text-right">
        <div className="flex justify-end gap-2 transition-opacity duration-200" style={{ opacity: hovered ? 1 : 0 }}>
          <ActionBtn icon="edit" hoverColor="#ffb4aa" title="Edit" href={`/admin/movies/${movie.movie_id}/edit`} />
          <ActionBtn icon="delete" hoverColor="#ffb4ab" title="Delete" onClick={() => onDelete(movie.movie_id)} />
        </div>
      </td>
    </tr>
  );
}

export default function MovieList() {
  useAdminHeader("Movie Library", "Manage your cinematic inventory, metadata, and availability.");

  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All Movies");

  useEffect(() => {
    Promise.all([
      apiFetch<ApiMovie[]>("/movies", { auth: false }),
      apiFetch<Genre[]>("/genres", { auth: false }),
    ])
      .then(([m, g]) => {
        setMovies(m);
        setGenres(g);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load movies"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this movie? This can't be undone.")) return;
    const previous = movies;
    setMovies((prev) => prev.filter((m) => m.movie_id !== id));
    try {
      await apiFetch(`/movies/${id}`, { method: "DELETE" });
    } catch (err) {
      setMovies(previous);
      setError(err instanceof ApiError ? err.message : "Failed to delete movie");
    }
  };

  const filtered = movies.filter((m) => {
    const status = STATUS_LABEL[m.status];
    const matchesFilter = activeFilter === "All Movies" || status === activeFilter;
    const matchesSearch = search === "" || m.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 px-5 md:px-20 py-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 20, color: "#e9bcb6" }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles..."
              className="w-full rounded-lg pl-10 pr-4 py-2 text-base text-white transition-colors outline-none"
              style={{ background: "#201f1f", border: "1px solid #5e3f3b", caretColor: "#ffb4aa" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#ffb4aa")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#5e3f3b")}
            />
          </div>
          <Link
            href="/admin/movies/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover-scale"
            style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.30)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            <span className="hidden sm:inline">Add Movie</span>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150"
            style={{ background: "#201f1f", border: `1px solid ${activeFilter === f ? "#ffb4aa" : "#5e3f3b"}`, color: activeFilter === f ? "#ffb4aa" : "#e5e2e1" }}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}

      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "rgba(26,26,26,0.60)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)", color: "#e9bcb6" }}>
                <th className="p-4 w-[60px]" />
                <th className="p-4 min-w-[250px]">Movie Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Release Date</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.map((movie) => (
                <MovieRow key={movie.movie_id} movie={movie} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
          {loading && <p className="p-6 text-sm" style={{ color: "#e9bcb6" }}>Loading movies...</p>}
          {!loading && filtered.length === 0 && <p className="p-6 text-sm" style={{ color: "#e9bcb6" }}>No movies found.</p>}
        </div>

        <div className="flex items-center justify-between p-4 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.10)", color: "#e9bcb6" }}>
          <div>Showing {filtered.length} of {movies.length} movies</div>
        </div>
      </div>
    </main>
  );
}
