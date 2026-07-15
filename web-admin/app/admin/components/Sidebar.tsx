"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth-client";

export type AdminNavKey =
  | "Dashboard"
  | "Movies"
  | "Actors"
  | "Genres"
  | "Branches"
  | "Amenities"
  | "Loyalty Tiers"
  | "Bookings"
  | "Users"
  | "Analytics";

export const NAV_LINKS: { label: AdminNavKey; icon: string; href: string }[] = [
  { label: "Dashboard", icon: "dashboard", href: "/admin" },
  { label: "Movies", icon: "movie", href: "/admin/movies" },
  { label: "Actors", icon: "theater_comedy", href: "/admin/actors" },
  { label: "Genres", icon: "category", href: "/admin/genres" },
  { label: "Branches", icon: "storefront", href: "/admin/branches" },
  { label: "Amenities", icon: "room_service", href: "/admin/amenities" },
  { label: "Bookings", icon: "confirmation_number", href: "/admin/bookings" },
  { label: "Loyalty Tiers", icon: "workspace_premium", href: "/admin/loyalty-tiers" },
  { label: "Users", icon: "group", href: "/admin/users" },
  { label: "Analytics", icon: "analytics", href: "/admin/analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    getCurrentUser()
      .then((user) => setAdminName(user.full_name))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav
      className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-40"
      style={{
        background: "rgba(26,26,26,0.70)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-8 py-8">
        <span className="text-3xl font-extrabold uppercase tracking-tighter" style={{ color: "#ffb4aa" }}>
          CinePremium
        </span>
      </div>

      {/* Links */}
      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200"
              style={isActive ? { background: "#e50914", color: "#fff", transform: "translateX(2px)" } : { color: "#e9bcb6" }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ffb4aa";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#e9bcb6";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(0)";
                }
              }}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200"
          style={pathname === "/admin/settings" ? { background: "#e50914", color: "#fff" } : { color: "#e9bcb6" }}
          onMouseEnter={(e) => {
            if (pathname !== "/admin/settings") (e.currentTarget as HTMLAnchorElement).style.color = "#ffb4aa";
          }}
          onMouseLeave={(e) => {
            if (pathname !== "/admin/settings") (e.currentTarget as HTMLAnchorElement).style.color = "#e9bcb6";
          }}
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 mt-2 w-full text-left rounded-lg transition-colors duration-200"
          style={{ color: "#e9bcb6" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ffb4aa")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e9bcb6")}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy-vGbvBOpb3NTEY1SCW14Bg51HMUAw7dZnJiXrfxQebY2o1j3aGTREgc0KuMTwj6i1bzPPoKjOEg_APmqcKh4pLhzdAEZOCRHD2e9JFiACsmGmBgACEO6RVm2Jb_twWiu0tKDXocWRhR6MOmVugcizvRhLiUiaVA9qmrD-bJvXLod3-auIdzyZVVdyZxevFW3dUZP3KAMgms0i6FJ_S3wz2nnL9Bz8CdRF99Bkw7hA-m0oqsrMgopt4Prd-2c5PjXoOJN8s0y7f7k"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            style={{ border: "1px solid rgba(229,9,20,0.30)" }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{adminName}</p>
            <p className="text-xs" style={{ color: "#e9bcb6" }}>Sign out</p>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
        </button>
      </div>
    </nav>
  );
}
