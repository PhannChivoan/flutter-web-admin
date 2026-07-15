"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

export function MobileTopBar() {
  return (
    <header
      className="md:hidden flex justify-between items-center px-5 py-4 w-full fixed top-0 z-50"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.80), transparent)" }}
    >
      <button
        className="flex items-center justify-center p-2 rounded-full"
        style={{
          background: "rgba(26,26,26,0.70)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <span className="material-symbols-outlined text-white">menu</span>
      </button>

      <span className="text-2xl font-extrabold uppercase tracking-tighter" style={{ color: "#ffb4aa" }}>
        CinePremium
      </span>

      <NotificationBell compact />
    </header>
  );
}

const MOBILE_NAV = [
  { label: "Dashboard", icon: "home", href: "/admin" },
  { label: "Movies", icon: "movie", href: "/admin/movies" },
  { label: "Branches", icon: "storefront", href: "/admin/branches" },
  { label: "Profile", icon: "person", href: "/admin/users" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3"
      style={{
        background: "rgba(19,19,19,0.80)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.6)",
      }}
    >
      {MOBILE_NAV.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 transition-transform duration-200 active:scale-95"
            style={{
              color: isActive ? "#ffb4aa" : "#e9bcb6",
              filter: isActive ? "drop-shadow(0 0 8px rgba(229,9,20,0.4))" : undefined,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span style={{ fontSize: 11, fontWeight: 500 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
