"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BranchForm from "../../BranchForm";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { type Theater } from "../../shared";

export default function EditBranchPage() {
  const params = useParams();
  const id = Number(params.id);
  useAdminHeader("Edit Branch", "Update this branch's details, image, and map location.");

  const [theater, setTheater] = useState<Theater | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Theater>(`/theaters/${id}`, { auth: false })
      .then(setTheater)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load branch"));
  }, [id]);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {theater ? <BranchForm editing={theater} /> : !error && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>}
    </main>
  );
}
