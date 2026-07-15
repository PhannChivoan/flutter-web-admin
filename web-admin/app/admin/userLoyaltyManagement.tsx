"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminHeader } from "./components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";

interface LoyaltyTier {
  tier_id: number;
  tier_name: string;
  min_points: number;
}

interface ApiUser {
  user_id: number;
  full_name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  loyalty_points: number;
  loyalty_tier_id: number;
  loyalty_tier?: LoyaltyTier;
}

interface TierStyle {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

const TIER_STYLES: TierStyle[] = [
  { bg: "rgba(255,255,255,0.10)", border: "rgba(255,255,255,0.20)", text: "#fff", dot: "#d1d5db" },
  { bg: "rgba(120,53,15,0.30)", border: "rgba(161,98,7,0.50)", text: "#eab308", dot: "#eab308" },
  { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)", text: "#c8c6c5", dot: "#c8c6c5" },
];

function tierStyle(tierId: number): TierStyle {
  return TIER_STYLES[(tierId - 1) % TIER_STYLES.length] ?? TIER_STYLES[TIER_STYLES.length - 1];
}

const glass: React.CSSProperties = {
  background: "rgba(26,26,26,0.60)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.10)",
};

function TierBadge({ tier }: { tier?: LoyaltyTier }) {
  if (!tier) return <span className="text-xs" style={{ color: "#8a8887" }}>—</span>;
  const s = tierStyle(tier.tier_id);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
      {tier.tier_name}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MemberRow({ user, onAdjustPoints, onManage }: { user: ApiUser; onAdjustPoints: (u: ApiUser) => void; onManage: (u: ApiUser) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="grid items-center py-3 px-2 rounded-lg transition-colors"
      style={{
        gridTemplateColumns: "4fr 3fr 3fr 2fr",
        gap: 16,
        background: hovered ? "rgba(255,255,255,0.05)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-semibold"
          style={{
            background: "#2a2a2a",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#e9bcb6",
          }}
        >
          {initials(user.full_name)}
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate transition-colors"
            style={{ color: hovered ? "#ffb4aa" : "#fff" }}
          >
            {user.full_name}
          </p>
          <p className="text-xs truncate" style={{ color: "#c8c6c5" }}>{user.email}</p>
        </div>
      </div>

      <div>
        <TierBadge tier={user.loyalty_tier} />
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold font-mono text-white">{user.loyalty_points.toLocaleString()}</p>
      </div>

      <div className="flex justify-end gap-2">
        <ActionIconBtn icon="add_circle" title="Adjust Points" onClick={() => onAdjustPoints(user)} />
        <ActionIconBtn icon="more_vert" title="Manage Account" onClick={() => onManage(user)} />
      </div>
    </div>
  );
}

function ActionIconBtn({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{ color: hovered ? "#fff" : "#c8c6c5" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
    </button>
  );
}

function EditUserModal({
  user,
  tiers,
  focusPoints,
  onClose,
  onSaved,
}: {
  user: ApiUser;
  tiers: LoyaltyTier[];
  focusPoints: boolean;
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
}) {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [tierId, setTierId] = useState<number>(user.loyalty_tier_id);
  const [points, setPoints] = useState(String(user.loyalty_points));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await apiFetch<ApiUser>(`/users/${user.user_id}`, {
        method: "PUT",
        body: JSON.stringify({
          full_name: fullName,
          email,
          loyalty_tier_id: tierId,
          loyalty_points: Number(points) || 0,
        }),
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update member");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.60)" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl p-6 flex flex-col gap-4"
        style={glass}
      >
        <h2 className="text-lg font-semibold text-white">Manage Account</h2>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c8c6c5" }}>Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#201f1f", border: "1px solid #5e3f3b" }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c8c6c5" }}>Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#201f1f", border: "1px solid #5e3f3b" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c8c6c5" }}>Loyalty tier</label>
            <select
              value={tierId}
              onChange={(e) => setTierId(Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "#201f1f", border: "1px solid #5e3f3b" }}
            >
              {tiers.map((t) => (
                <option key={t.tier_id} value={t.tier_id}>{t.tier_name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c8c6c5" }}>Points</label>
            <input
              autoFocus={focusPoints}
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "#201f1f", border: "1px solid #5e3f3b" }}
            />
          </div>
        </div>

        {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: "#e50914", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoyaltyManagement() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [focusPoints, setFocusPoints] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch<ApiUser[]>("/users"), apiFetch<LoyaltyTier[]>("/loyalty-tiers", { auth: false })])
      .then(([u, t]) => {
        setUsers(u);
        setTiers(t);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load members"))
      .finally(() => setLoading(false));
  }, []);

  const handleUserSaved = (updated: ApiUser) => {
    setUsers((prev) => prev.map((u) => (u.user_id === updated.user_id ? { ...u, ...updated } : u)));
    setEditingUser(null);
  };

  const filtered = users.filter(
    (u) =>
      search === "" ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const metrics = useMemo(() => {
    const topTierId = Math.max(0, ...users.map((u) => u.loyalty_tier_id));
    const topTierCount = users.filter((u) => u.loyalty_tier_id === topTierId).length;
    const avgPoints = users.length
      ? Math.round(users.reduce((sum, u) => sum + u.loyalty_points, 0) / users.length)
      : 0;
    return [
      { label: "Total Members", value: users.length.toLocaleString(), icon: "group", highlight: false },
      { label: "Top Tier Members", value: topTierCount.toLocaleString(), icon: "stars", highlight: false },
      { label: "Avg. Points / Member", value: avgPoints.toLocaleString(), icon: "toll", highlight: true },
    ];
  }, [users]);

  useAdminHeader("Loyalty Management", "Manage user accounts, adjust points, and configure reward thresholds.");

  return (
      <main className="flex-grow px-5 md:px-20 py-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-end gap-4">
          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white transition-colors"
              style={{ ...glass, border: "1px solid rgba(255,255,255,0.20)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(26,26,26,0.60)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
              Reward Config
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white transition-colors"
              style={{ background: "#e50914" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#c0000c")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#e50914")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
              Add Member
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-4 flex flex-col gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-6 flex items-center justify-between"
                style={glass}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "#c8c6c5" }}>
                    {m.label}
                  </p>
                  <p
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: m.highlight ? "#ffb4aa" : "#fff" }}
                  >
                    {m.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: m.highlight ? "rgba(229,9,20,0.20)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${m.highlight ? "rgba(229,9,20,0.50)" : "rgba(255,255,255,0.10)"}`,
                    color: "#ffb4aa",
                  }}
                >
                  <span className="material-symbols-outlined">{m.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="md:col-span-8 rounded-xl p-6 flex flex-col"
            style={{ ...glass, minHeight: 500 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-white">Member Directory</h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 18, color: "#c8c6c5" }}
                  >
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members..."
                    className="w-full rounded-lg py-2 pl-10 pr-4 text-white text-base outline-none transition-all"
                    style={{
                      background: "rgba(0,0,0,0.50)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      caretColor: "#ffb4aa",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#e50914";
                      e.currentTarget.style.boxShadow = "0 0 0 1px #e50914";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <FilterBtn />
              </div>
            </div>

            <div
              className="grid pb-2 mb-4 text-xs font-semibold uppercase tracking-wider px-2"
              style={{
                gridTemplateColumns: "4fr 3fr 3fr 2fr",
                gap: 16,
                borderBottom: "1px solid rgba(255,255,255,0.10)",
                color: "#c8c6c5",
              }}
            >
              <div>User</div>
              <div>Tier</div>
              <div className="text-right">Points</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
              {error && <p className="text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
              {loading && <p className="text-sm" style={{ color: "#c8c6c5" }}>Loading members...</p>}
              {!loading && filtered.length === 0 && !error && (
                <p className="text-sm" style={{ color: "#c8c6c5" }}>No members found.</p>
              )}
              {filtered.map((user) => (
                <MemberRow
                  key={user.user_id}
                  user={user}
                  onAdjustPoints={(u) => {
                    setEditingUser(u);
                    setFocusPoints(true);
                  }}
                  onManage={(u) => {
                    setEditingUser(u);
                    setFocusPoints(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {editingUser && (
          <EditUserModal
            user={editingUser}
            tiers={tiers}
            focusPoints={focusPoints}
            onClose={() => setEditingUser(null)}
            onSaved={handleUserSaved}
          />
        )}
      </main>
  );
}

function FilterBtn() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="p-2 rounded-lg transition-colors"
      style={{
        background: "rgba(0,0,0,0.50)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: hovered ? "#fff" : "#c8c6c5",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="material-symbols-outlined">filter_list</span>
    </button>
  );
}
