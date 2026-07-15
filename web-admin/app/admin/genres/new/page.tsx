"use client";

import GenreForm from "../GenreForm";
import { useAdminHeader } from "../../components/AdminHeaderContext";

export default function NewGenrePage() {
  useAdminHeader("Add Genre", "Create a new genre for classifying movies.");
  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <GenreForm />
    </main>
  );
}
