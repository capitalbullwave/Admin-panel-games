"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label, description, className = "" }: ImageUploadProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, WEBP are allowed");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Create axios instance that doesn't stringify data
      const res = await api.post("/uploads/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onChange(res.data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BASE_URL + value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
            ${isDragging ? 'border-amber-500 bg-amber-500/5' : 'border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            aspect-video
          `}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
          ) : (
            <UploadCloud className={`w-8 h-8 mb-3 ${isDragging ? 'text-amber-500' : 'text-slate-400'}`} />
          )}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isUploading ? "Uploading..." : "Click or drag image to upload"}
          </p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={onChangeFile}
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
      )}
    </div>
  );
}
