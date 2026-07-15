"use client";

import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: string;
  unread?: boolean;
}

const NOTIFICATIONS: Notification[] = [
  { id: "1", title: "High Demand Alert", detail: "\"Interstellar\" evening shows are at 92% occupancy.", time: "5m ago", icon: "local_fire_department", unread: true },
  { id: "2", title: "New Booking", detail: "Sarah Jenkins booked 2 tickets for Dune: Part Two.", time: "12m ago", icon: "confirmation_number", unread: true },
  { id: "3", title: "Kiosk Sync Degraded", detail: "North Park IMAX kiosk sync delayed by 15ms.", time: "1h ago", icon: "sync_problem" },
  { id: "4", title: "New Loyalty Member", detail: "Marcus Reed joined the Silver tier.", time: "3h ago", icon: "person_add" },
];

export default function NotificationBell({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? "flex items-center justify-center p-2 rounded-full relative"
            : "flex items-center justify-center p-3 rounded-full relative transition-colors duration-200"
        }
        style={{
          background: "rgba(26,26,26,0.70)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(20px)",
          color: compact ? "#fff" : "#e9bcb6",
        }}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span
            className={compact ? "absolute top-1 right-1 w-2 h-2 rounded-full" : "absolute top-2 right-2 w-2.5 h-2.5 rounded-full"}
            style={{ background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            width: 340,
            maxWidth: "90vw",
            background: "rgba(20,19,19,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: "#ffb4aa" }}>
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {NOTIFICATIONS.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <span
                  className="material-symbols-outlined flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    fontSize: 18,
                    background: n.unread ? "rgba(229,9,20,0.20)" : "rgba(255,255,255,0.05)",
                    color: n.unread ? "#ffb4aa" : "#c8c6c5",
                  }}
                >
                  {n.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#c8c6c5" }}>{n.detail}</p>
                  <p className="text-[11px] mt-1" style={{ color: "#8a8887" }}>{n.time}</p>
                </div>
                {n.unread && (
                  <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: "#e50914" }} />
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffb4aa" }}>
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
