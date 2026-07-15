"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AmenityForm from "../../AmenityForm";
import { useAdminHeader } from "../../../components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";
import { type Amenity } from "../../shared";

export default function EditAmenityPage() {
  const params = useParams();
  const id = Number(params.id);
  useAdminHeader("Edit Amenity", "Update this amenity's name.");

  const [amenity, setAmenity] = useState<Amenity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Amenity>(`/amenities/${id}`, { auth: false })
      .then(setAmenity)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load amenity"));
  }, [id]);

  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      {error && <p className="mb-4 text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
      {amenity ? <AmenityForm editing={amenity} /> : !error && <p className="text-sm" style={{ color: "#e9bcb6" }}>Loading...</p>}
    </main>
  );
}
