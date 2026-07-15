"use client";

import { useEffect, useState } from "react";
import MovieForm from "../MovieForm";
import { useAdminHeader } from "../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { Genre } from "../shared";
import { type Actor } from "../../actors/shared";

export default function NewMoviePage() {
  useAdminHeader("Add Movie", "Add a new title to the catalog.");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Genre[]>("/genres", { auth: false }),
      apiFetch<Actor[]>("/actors", { auth: false }),
    ])
      .then(([g, a]) => {
        setGenres(g);
        setActors(a);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load genres"));
  }, []);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      <MovieForm genres={genres} actors={actors} />
    </main>
  );
}
