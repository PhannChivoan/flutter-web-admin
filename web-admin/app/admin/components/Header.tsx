"use client";

import NotificationBell from "./NotificationBell";
import { useAdminHeaderState } from "./AdminHeaderContext";

export default function Header() {
  const { header } = useAdminHeaderState();

  return (
    <div
      className="hidden md:flex justify-between items-center px-20 py-8 sticky top-0 z-30"
      style={{ background: "rgba(8,8,8,0.80)", backdropFilter: "blur(12px)" }}
    >
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white transition-opacity duration-200">{header.title}</h1>
        <p className="mt-1 text-base transition-opacity duration-200" style={{ color: "#e9bcb6" }}>
          {header.subtitle}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center px-4 py-2 rounded-full"
          style={{
            background: "rgba(26,26,26,0.70)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
          }}
        >
          <span className="material-symbols-outlined mr-2" style={{ color: "#e9bcb6" }}>search</span>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-white w-48 text-sm"
            style={{ caretColor: "#ffb4aa" }}
          />
        </div>
        <NotificationBell />
      </div>
    </div>
  );
}
