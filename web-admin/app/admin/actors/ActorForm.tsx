"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, apiUpload, apiUrl, ApiError } from "@/lib/api";
import { inputStyle, glassStyle, type Actor } from "./shared";

export default function ActorForm({ editing }: { editing?: Actor }) {
  const router = useRouter();
  const [name, setName] = useState(editing?.name ?? "");
  const [bio, setBio] = useState(editing?.bio ?? "");

  const [photoMode, setPhotoMode] = useState<"url" | "upload">("url");
  const [photoUrl, setPhotoUrl] = useState(editing?.photo_url ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const previewSrc = photoMode === "upload" ? filePreview : photoUrl || apiUrl(editing?.photo_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name,
        bio: bio || null,
        ...(photoMode === "url" ? { photo_url: photoUrl || null } : {}),
      };

      let actor = editing
        ? await apiFetch<Actor>(`/actors/${editing.actor_id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiFetch<Actor>("/actors", { method: "POST", body: JSON.stringify(payload) });

      if (photoMode === "upload" && photoFile) {
        actor = await apiUpload<Actor>(`/actors/${actor.actor_id}/photo`, photoFile);
      }

      router.push("/admin/actors");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save actor");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl flex flex-col gap-6">
      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <h2 className="text-lg font-semibold text-white">Actor Details</h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Full name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-lg px-4 py-2 text-sm outline-none resize-none" style={inputStyle} />
        </div>
      </div>

      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Profile Photo</h2>
          <div className="flex gap-1 rounded-md p-0.5" style={{ background: "#151414" }}>
            {(["url", "upload"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPhotoMode(m)}
                className="px-3 py-1.5 rounded text-xs font-semibold uppercase transition-colors"
                style={photoMode === m ? { background: "#e50914", color: "#fff" } : { color: "#8a8887" }}
              >
                {m === "url" ? "Paste URL" : "Upload"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            {photoMode === "url" ? (
              <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg px-4 py-3 text-sm outline-none" style={inputStyle} />
            ) : (
              <label
                className="w-full rounded-lg px-4 py-8 text-sm outline-none text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 hover-scale"
                style={{ ...inputStyle, borderStyle: "dashed" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#ffb4aa" }}>add_a_photo</span>
                <span style={{ color: "#e9bcb6" }}>{photoFile ? photoFile.name : "Click to choose a photo"}</span>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
            )}
          </div>
          <div
            className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: 120, height: 120, background: "#151414", border: "1px solid #5e3f3b" }}
          >
            {previewSrc ? (
              <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined" style={{ color: "#5e3f3b", fontSize: 32 }}>person</span>
            )}
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

      <div className="flex justify-end gap-3 pb-8">
        <button type="button" onClick={() => router.push("/admin/actors")} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.4)", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : editing ? "Save Changes" : "Create Actor"}
        </button>
      </div>
    </form>
  );
}
