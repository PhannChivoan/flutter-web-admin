"use client";

import { useEffect, useState } from "react";
import { inputStyle } from "./shared";

export type MediaMode = "url" | "upload";

export default function MediaField({
  label,
  accept,
  kind,
  mode,
  setMode,
  urlValue,
  setUrlValue,
  file,
  setFile,
  currentUrl,
}: {
  label: string;
  accept: string;
  kind: "image" | "video";
  mode: MediaMode;
  setMode: (m: MediaMode) => void;
  urlValue: string;
  setUrlValue: (v: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  currentUrl?: string;
}) {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewSrc = mode === "upload" ? filePreview : urlValue || currentUrl;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#e9bcb6" }}>{label}</label>
        <div className="flex gap-1 rounded-md p-0.5" style={{ background: "#151414" }}>
          {(["url", "upload"] as MediaMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded text-xs font-semibold uppercase transition-colors"
              style={mode === m ? { background: "#e50914", color: "#fff" } : { color: "#8a8887" }}
            >
              {m === "url" ? "Paste URL" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-2">
          {mode === "url" ? (
            <input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={inputStyle}
            />
          ) : (
            <label
              className="w-full rounded-lg px-4 py-8 text-sm outline-none text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 hover-scale"
              style={{ ...inputStyle, borderStyle: "dashed" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#ffb4aa" }}>
                {kind === "image" ? "add_photo_alternate" : "video_file"}
              </span>
              <span style={{ color: "#e9bcb6" }}>{file ? file.name : `Click to choose a ${kind} file`}</span>
              <input
                type="file"
                accept={accept}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          )}
          {currentUrl && (
            <p className="text-[11px] truncate" style={{ color: "#8a8887" }}>Current: {currentUrl}</p>
          )}
        </div>

        <div
          className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ width: 160, height: 120, background: "#151414", border: "1px solid #5e3f3b" }}
        >
          {previewSrc ? (
            kind === "image" ? (
              <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <video src={previewSrc} className="w-full h-full object-cover" muted controls />
            )
          ) : (
            <span className="material-symbols-outlined" style={{ color: "#5e3f3b", fontSize: 28 }}>
              {kind === "image" ? "image" : "movie"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
