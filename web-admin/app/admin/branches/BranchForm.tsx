"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { apiFetch, apiUpload, apiUrl, ApiError } from "@/lib/api";
import { inputStyle, glassStyle, type Theater } from "./shared";

const LocationPicker = dynamic(() => import("../components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg flex items-center justify-center" style={{ height: 260, background: "#151414", border: "1px solid #5e3f3b", color: "#8a8887" }}>
      Loading map...
    </div>
  ),
});

export default function BranchForm({ editing }: { editing?: Theater }) {
  const router = useRouter();
  const [name, setName] = useState(editing?.theater_name ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");
  const [city, setCity] = useState(editing?.city ?? "");
  const [state, setState] = useState(editing?.state ?? "");
  const [zip, setZip] = useState(editing?.zip ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [starRating, setStarRating] = useState(editing?.star_rating ?? "");
  const [lat, setLat] = useState<number | null>(editing?.latitude ? Number(editing.latitude) : null);
  const [lng, setLng] = useState<number | null>(editing?.longitude ? Number(editing.longitude) : null);

  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageUrl, setImageUrl] = useState(editing?.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [filePreview, setFilePreview] = useState<string | null>(null);
  useEffect(() => {
    if (!imageFile) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const previewSrc = imageMode === "upload" ? filePreview : imageUrl || apiUrl(editing?.image_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        theater_name: name,
        address,
        city,
        state,
        zip,
        phone: phone || null,
        description: description || null,
        star_rating: starRating !== "" ? Number(starRating) : null,
        latitude: lat,
        longitude: lng,
        ...(imageMode === "url" ? { image_url: imageUrl || null } : {}),
      };

      let theater = editing
        ? await apiFetch<Theater>(`/theaters/${editing.theater_id}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiFetch<Theater>("/theaters", { method: "POST", body: JSON.stringify(payload) });

      if (imageMode === "upload" && imageFile) {
        theater = await apiUpload<Theater>(`/theaters/${theater.theater_id}/image`, imageFile);
      }

      router.push("/admin/branches");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save branch");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl flex flex-col gap-6">
      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <h2 className="text-lg font-semibold text-white">Branch Details</h2>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Branch name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none transition-colors" style={inputStyle} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Address</label>
          <input required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg px-4 py-2 text-sm outline-none transition-colors" style={inputStyle} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>City</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>State</label>
            <input required value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Zip</label>
            <input required value={zip} onChange={(e) => setZip(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Rating (0–9.9)</label>
            <input
              type="number"
              min={0}
              max={9.9}
              step={0.1}
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
              placeholder="e.g. 4.5"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg px-4 py-2 text-sm outline-none resize-none" style={inputStyle} />
        </div>
      </div>

      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <h2 className="text-lg font-semibold text-white">Branch Image</h2>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-md p-0.5" style={{ background: "#151414" }}>
            {(["url", "upload"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setImageMode(m)}
                className="px-2 py-1 rounded text-[11px] font-semibold uppercase transition-colors"
                style={imageMode === m ? { background: "#e50914", color: "#fff" } : { color: "#8a8887" }}
              >
                {m === "url" ? "Paste URL" : "Upload"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            {imageMode === "url" ? (
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg px-4 py-3 text-sm outline-none" style={inputStyle} />
            ) : (
              <label
                className="w-full rounded-lg px-4 py-8 text-sm outline-none text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 hover-scale"
                style={{ ...inputStyle, borderStyle: "dashed" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#ffb4aa" }}>add_photo_alternate</span>
                <span style={{ color: "#e9bcb6" }}>{imageFile ? imageFile.name : "Click to choose an image file"}</span>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
            )}
          </div>
          <div
            className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ width: 160, height: 120, background: "#151414", border: "1px solid #5e3f3b" }}
          >
            {previewSrc ? (
              <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined" style={{ color: "#5e3f3b", fontSize: 28 }}>storefront</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6 flex flex-col gap-4" style={glassStyle()}>
        <h2 className="text-lg font-semibold text-white">Location (for mobile app map)</h2>
        <p className="text-xs" style={{ color: "#8a8887" }}>Click on the map to drop a pin for this branch's latitude/longitude.</p>
        <LocationPicker latitude={lat} longitude={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Latitude</label>
            <input value={lat ?? ""} readOnly className="w-full rounded-lg px-3 py-2 text-sm outline-none opacity-70" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>Longitude</label>
            <input value={lng ?? ""} readOnly className="w-full rounded-lg px-3 py-2 text-sm outline-none opacity-70" style={inputStyle} />
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#ff8a80", fontSize: 13 }}>{error}</p>}

      <div className="flex justify-end gap-3 pb-8">
        <button type="button" onClick={() => router.push("/admin/branches")} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover-scale" style={{ background: "#e50914", boxShadow: "0 0 15px rgba(229,9,20,0.4)", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : editing ? "Save Changes" : "Create Branch"}
        </button>
      </div>
    </form>
  );
}
