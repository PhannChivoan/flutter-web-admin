"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface HeaderState {
  title: string;
  subtitle: string;
}

const AdminHeaderContext = createContext<{
  header: HeaderState;
  setHeader: (h: HeaderState) => void;
} | null>(null);

export function AdminHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<HeaderState>({ title: "", subtitle: "" });
  return (
    <AdminHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </AdminHeaderContext.Provider>
  );
}

export function useAdminHeaderState() {
  const ctx = useContext(AdminHeaderContext);
  if (!ctx) throw new Error("useAdminHeaderState must be used within AdminHeaderProvider");
  return ctx;
}

// Call from any admin page to set the shared header's title/subtitle
// without remounting the sidebar/header shell.
export function useAdminHeader(title: string, subtitle: string) {
  const { setHeader } = useAdminHeaderState();
  useEffect(() => {
    setHeader({ title, subtitle });
  }, [title, subtitle, setHeader]);
}
