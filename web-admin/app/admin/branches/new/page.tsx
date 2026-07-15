"use client";

import BranchForm from "../BranchForm";
import { useAdminHeader } from "../../components/AdminHeaderContext";

export default function NewBranchPage() {
  useAdminHeader("Add Branch", "Create a new cinema location.");
  return (
    <main className="px-5 md:px-20 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
      <BranchForm />
    </main>
  );
}
