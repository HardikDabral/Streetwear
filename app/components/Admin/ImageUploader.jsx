"use client";

import React, { useState } from "react";
import { cn } from "@/app/lib/cn";
import { CloseIcon, PlusIcon } from "../ui/Icons";

const uploadOne = async (file) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env"
    );
  }
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", preset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: data }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Upload failed");
  return json.secure_url;
};

const ImageUploader = ({ images, onChange, max = 6 }) => {
  const safeImages = Array.isArray(images) ? images : [];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFiles = async (files) => {
    setError("");
    const arr = Array.from(files).slice(0, max - safeImages.length);
    if (arr.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(arr.map((f) => uploadOne(f)));
      onChange([...safeImages, ...urls]);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = (i) => onChange(safeImages.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const next = [...safeImages];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...safeImages, urlInput.trim()]);
    setUrlInput("");
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
        {safeImages.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group bg-white/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="px-2 py-0.5 text-xs bg-white/20 rounded disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === safeImages.length - 1}
                  className="px-2 py-0.5 text-xs bg-white/20 rounded disabled:opacity-30"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="px-2 py-1 text-xs bg-red-500/80 rounded inline-flex items-center gap-1"
              >
                <CloseIcon width={12} height={12} /> Remove
              </button>
            </div>
            {i === 0 && (
              <span className="absolute top-1 left-1 text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded">
                MAIN
              </span>
            )}
          </div>
        ))}

        {safeImages.length < max && (
          <label
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs text-white/60 cursor-pointer transition-colors",
              dragging
                ? "border-white bg-white/5"
                : "border-white/20 hover:border-white/40 hover:bg-white/5"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <span>Uploading…</span>
            ) : (
              <>
                <PlusIcon />
                <span className="mt-1">Add image</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* URL fallback */}
      <div className="flex gap-2 mb-2">
        <input
          type="url"
          placeholder="Or paste image URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 bg-white/5 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim() || safeImages.length >= max}
          className="px-4 py-2 rounded-md bg-white/10 text-sm text-white hover:bg-white/20 disabled:opacity-40"
        >
          Add URL
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
      <p className="text-[11px] text-white/40 mt-2">
        First image is the main thumbnail. Up to {max} images. Drag &amp; drop or click to upload.
      </p>
    </div>
  );
};

export default ImageUploader;
