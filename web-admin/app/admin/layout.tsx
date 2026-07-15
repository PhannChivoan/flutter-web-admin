"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { MobileTopBar, MobileBottomNav } from "./components/MobileNav";
import { AdminHeaderProvider, useAdminHeaderState } from "./components/AdminHeaderContext";
import { isLoggedIn } from "@/lib/api";

function MobileTitleSpacer() {
  const { header } = useAdminHeaderState();
  return (
    <div className="md:hidden px-5 pt-20 pb-2">
      <h1 className="text-2xl font-bold text-white tracking-tight">{header.title}</h1>
      <p className="text-sm mt-1" style={{ color: "#e9bcb6" }}>{header.subtitle}</p>
    </div>
  );
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <AdminHeaderProvider>
      <div
        className="min-h-screen flex flex-col md:flex-row overflow-hidden"
        style={{ background: "#080808", color: "#e5e2e1" }}
      >
        {/* Google Fonts + Material Symbols (loaded once, shell no longer remounts on nav) */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #353534; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #474746; }
          .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-smoothing: antialiased; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .hover-lift { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.25s ease; }
          .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.45); }
          .hover-scale { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .hover-scale:hover { transform: scale(1.03); }
          .fade-in { animation: adminFadeIn 0.35s ease both; }
          @keyframes adminFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        <MobileTopBar />
        <Sidebar />

        <main className="flex-1 md:ml-64 h-screen overflow-y-auto pb-24 md:pb-0">
          <Header />
          <MobileTitleSpacer />
          <div key={pathname} className="fade-in">
            {children}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </AdminHeaderProvider>
  );
}
