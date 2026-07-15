"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MovieForm from "../../MovieForm";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { ApiMovie, CastEntry, Genre } from "../../shared";
import { type Actor } from "../../../actors/shared";

export default function EditMoviePage() {
  const params = useParams();
  const id = Number(params.id);
  useAdminHeader("Edit Movie", "Update this title's metadata, poster, trailer, and cast.");

  const [movie, setMovie] = useState<ApiMovie | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [cast, setCast] = useState<CastEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<ApiMovie>(`/movies/${id}`, { auth: false }),
      apiFetch<Genre[]>("/genres", { auth: false }),
      apiFetch<Actor[]>("/actors", { auth: false }),
      apiFetch<CastEntry[]>(`/cast?movie_id=${id}`, { auth: false }),
    ])
      .then(([m, g, a, c]) => {
        setMovie(m);
        setGenres(g);
        setActors(a);
        setCast(c);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load movie"));
  }, [id]);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {movie ? (
        <MovieForm genres={genres} actors={actors} editing={movie} editingCast={cast} />
      ) : (
        !error && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>
      )}
    </main>
  );
}
