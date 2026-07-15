"use client";

import { useEffect, useState } from "react";
import { useAdminHeader } from "./components/AdminHeaderContext";
import { apiFetch, ApiError } from "@/lib/api";

interface CurrentUser {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
}

function GlassPanel({ children, className = "", style = {} }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{
        background: "rgba(26,26,26,0.70)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.10)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#201f1f",
  border: "1px solid #5e3f3b",
  color: "#fff",
  caretColor: "#ffb4aa",
};

function Toggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "#8a8887" }}>{description}</p>
      </div>
      <button
        onClick={() => setChecked((v) => !v)}
        className="relative flex-shrink-0 transition-colors duration-200"
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          background: checked ? "#e50914" : "#353534",
        }}
      >
        <span
          className="absolute top-0.5 rounded-full transition-all duration-200"
          style={{
            width: 20,
            height: 20,
            background: "#fff",
            left: checked ? 22 : 2,
          }}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<CurrentUser>("/auth/me")
      .then((u) => {
        setUser(u);
        setFullName(u.full_name);
        setPhone(u.phone ?? "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
      if (!currentPassword) {
        setError("Enter your current password to set a new one.");
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await apiFetch<CurrentUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName, phone: phone || null }),
      });
      setUser(updated);

      if (newPassword && currentPassword) {
        await apiFetch("/mobile/profile/change-password", {
          method: "POST",
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setSuccess("Changes saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  useAdminHeader("Settings", "Manage your admin profile, security, and notification preferences.");

  return (
      <div className="px-5 md:px-20 pb-8 space-y-4 max-w-3xl">
        {/* Profile */}
        <GlassPanel className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-white">Admin Profile</h2>
          {loading ? (
            <p className="text-sm" style={{ color: "#8a8887" }}>Loading profile...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
              </Field>
              <Field label="Email">
                <input value={user?.email ?? ""} disabled className="w-full rounded-lg px-4 py-2 text-sm outline-none opacity-60" style={inputStyle} />
              </Field>
              <Field label="Role">
                <input value={user?.role === "ADMIN" ? "Administrator" : (user?.role ?? "")} disabled className="w-full rounded-lg px-4 py-2 text-sm outline-none opacity-60" style={inputStyle} />
              </Field>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
              </Field>
            </div>
          )}
        </GlassPanel>

        {/* Security */}
        <GlassPanel className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-white">Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Current Password">
              <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
            </Field>
            <div />
            <Field label="New Password">
              <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
            </Field>
            <Field label="Confirm Password">
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
            </Field>
          </div>
          <Toggle label="Two-Factor Authentication" description="Require a verification code at login." defaultChecked />
        </GlassPanel>

        {/* Notifications */}
        <GlassPanel className="p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-2">Notification Preferences</h2>
          <Toggle label="Booking Alerts" description="Get notified for every new booking." defaultChecked />
          <Toggle label="High Demand Alerts" description="Get notified when occupancy exceeds 90%." defaultChecked />
          <Toggle label="System Status Emails" description="Weekly email digest of system health." />
        </GlassPanel>

        {error && <p className="text-sm" style={{ color: "#ff8a80" }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: "#34d399" }}>{success}</p>}

        <div className="flex justify-end gap-2 pb-8">
          <button
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.4)", opacity: saving ? 0.7 : 1 }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
  );
}
