"use client";

import ActorForm from "../ActorForm";
import { useAdminHeader } from "../../components/AdminHeaderContext";

export default function NewActorPage() {
  useAdminHeader("Add Actor", "Create a new actor profile for casting.");
  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <ActorForm />
    </main>
  );
}
