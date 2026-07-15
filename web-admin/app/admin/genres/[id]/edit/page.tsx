"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GenreForm from "../../GenreForm";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { type Genre } from "../../shared";

export default function EditGenrePage() {
  const params = useParams();
  const id = Number(params.id);
  useAdminHeader("Edit Genre", "Update this genre's name.");

  const [genre, setGenre] = useState<Genre | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Genre>(`/genres/${id}`, { auth: false })
      .then(setGenre)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load genre"));
  }, [id]);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {genre ? <GenreForm editing={genre} /> : !error && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>}
    </main>
  );
}
