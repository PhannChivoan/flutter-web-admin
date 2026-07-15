"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ActorForm from "../../ActorForm";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { type Actor } from "../../shared";

export default function EditActorPage() {
  const params = useParams();
  const id = Number(params.id);
  useAdminHeader("Edit Actor", "Update this actor's profile and photo.");

  const [actor, setActor] = useState<Actor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Actor>(`/actors/${id}`, { auth: false })
      .then(setActor)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load actor"));
  }, [id]);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {actor ? <ActorForm editing={actor} /> : !error && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>}
    </main>
  );
}
