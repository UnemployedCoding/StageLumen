"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import GalleryDragSlider from "./GalleryDragSlider";

const ROOM_TYPES = [
  { id: "living-room", label: "Living Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "kitchen", label: "Kitchen" },
  { id: "home-office", label: "Home Office" },
  { id: "dining-room", label: "Dining Room" },
  { id: "bathroom", label: "Bathroom" },
  { id: "outdoor", label: "Outdoor" },
];

const STYLES = [
  { id: "modern", label: "Modern" },
  { id: "scandinavian", label: "Scandinavian" },
  { id: "luxury", label: "Luxury" },
  { id: "midcentury", label: "Midcentury" },
  { id: "coastal", label: "Coastal" },
  { id: "farmhouse", label: "Farmhouse" },
  { id: "industrial", label: "Industrial" },
];

export default function Uploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roomType, setRoomType] = useState(ROOM_TYPES[0].id);
  const [style, setStyle] = useState(STYLES[0].id);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stagedResult, setStagedResult] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, etc).");
      return;
    }
    
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setStagedResult(null); // Reset previous result if any
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleStageRoom = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("room_type", roomType);
      formData.append("style", style);

      const response = await fetch("/api/stage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to stage room");
      }

      // Check if it's a mock fallback from our API
      const finalUrl = data.staged_image_url?.includes("undefined")
        ? "/demo/living-room-modern.c831fe91.webp"
        : data.staged_image_url;

      // Preload the image so the transition to the slider is instant and flicker-free
      await new Promise<void>((resolve) => {
        const img = new window.Image();
        img.src = finalUrl;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      setStagedResult(finalUrl);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStagedResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Try StageLumen for Free</h2>
        <p className="text-slate-500">Upload a photo of an empty room and let AI furnish it in minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Uploader / Result */}
        <div className="lg:col-span-8">
          {stagedResult && previewUrl ? (
            // ─── Result View ───
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner" style={{ aspectRatio: "4/3" }}>
              <GalleryDragSlider
                beforeImage={previewUrl}
                afterImage={stagedResult}
                initialPosition={50}
              />
              <button 
                onClick={reset}
                className="absolute top-16 right-4 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md transition-all shadow-lg"
                title="Start over"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : previewUrl ? (
            // ─── Preview Original View ───
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200" style={{ aspectRatio: "4/3" }}>
              <Image src={previewUrl} alt="Original uploaded image" fill className="object-cover" />
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-30 transition-all duration-300">
                  <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center max-w-xs text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
                    <p className="font-semibold text-base mb-1">Staging your room...</p>
                    <p className="text-xs text-slate-300">
                      AI is furnishing your space. This can take 1–2 minutes or longer.
                    </p>
                    <div className="mt-4 px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-blue-300">
                      {loadingTime}s
                    </div>
                  </div>
                </div>
              )}
              <button 
                onClick={reset}
                disabled={isLoading ? true : undefined}
                className="absolute top-4 right-4 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            // ─── Upload Dropzone ───
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? "border-blue-500 bg-blue-50/50 scale-[1.01]" 
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
              }`}
              style={{ aspectRatio: "4/3" }}
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload your photo</h3>
              <p className="text-sm text-slate-500 mb-4">Drag and drop, or click to browse</p>
              <p className="text-xs text-slate-400">Supports JPG, PNG (Max 10MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />
            </div>
          )}
        </div>

        {/* Right Side: Controls */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Customize Staging</h3>
            
            <div className="space-y-5">
              {/* Room Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
                <div className="relative">
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    disabled={(isLoading || stagedResult !== null) ? true : undefined}
                    className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                  >
                    {ROOM_TYPES.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Interior Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      disabled={(isLoading || stagedResult !== null) ? true : undefined}
                      onClick={() => setStyle(s.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all border ${
                        style === s.id
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60 disabled:hover:bg-white disabled:hover:border-slate-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={stagedResult ? reset : handleStageRoom}
            disabled={(!selectedFile || isLoading) ? true : undefined}
            className={`w-full flex items-center justify-center py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              !selectedFile 
                ? "bg-slate-300 cursor-not-allowed shadow-none" 
                : stagedResult
                ? "bg-slate-800 hover:bg-slate-900"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20"
            }`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Staging your room...</span>
                </div>
                <span className="text-xs text-white/80 mt-1 font-normal tracking-wide">
                  This can take 1–2 minutes or longer ({loadingTime}s)
                </span>
              </div>
            ) : stagedResult ? (
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <span>Stage Another Photo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Stage Room Now</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
