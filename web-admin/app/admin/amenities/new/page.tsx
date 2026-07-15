"use client";

import AmenityForm from "../AmenityForm";
import { useAdminHeader } from "../../components/AdminHeaderContext";

export default function NewAmenityPage() {
  useAdminHeader("Add Amenity", "Create a new amenity for describing theaters.");
  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <AmenityForm />
    </main>
  );
}
