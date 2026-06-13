"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, ArrowLeft, Image as ImageIcon, Layout, Tag, Calendar, Activity, Settings2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function CategoryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ["game-category", id],
    queryFn: async () => {
      const res = await api.get(`/game-categories/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Category Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 text-amber-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/games/categories">
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              {category.name}
              {category.is_active ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Active</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Inactive</span>
              )}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">/{category.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white shadow-sm font-semibold transition-all">
            <Settings2 className="w-4 h-4 text-amber-500" />
            Edit Category
          </button>
        </div>
      </div>

      {/* Banner */}
      {category.banner_url && (
        <div className="w-full h-64 rounded-3xl overflow-hidden shadow-2xl relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + category.banner_url} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-6 left-8">
            <span className="text-white/80 font-medium text-sm tracking-widest uppercase">Category Banner</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Information</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                    <p className="text-slate-900 dark:text-slate-300">{category.description || "No description provided."}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Brand Color</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: category.color_code || "#000" }}></div>
                      <span className="font-mono text-slate-900 dark:text-white uppercase">{category.color_code || "None"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">SEO Title</p>
                    <p className="text-slate-900 dark:text-slate-300 font-medium">{category.seo_title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">SEO Description</p>
                    <p className="text-slate-900 dark:text-slate-300">{category.seo_description || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Media Assets</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-3">Category Icon</p>
                  {category.icon ? (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + category.icon} alt="Icon" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400">No Icon</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-3">Thumbnail (16:9)</p>
                  {category.thumbnail_url ? (
                    <div className="w-full max-w-sm aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-black flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + category.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full max-w-sm aspect-video rounded-2xl border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400">No Thumbnail</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats & Metadata */}
        <div className="space-y-8">
          <Card className="border-slate-200 dark:border-white/5 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-amber-100 font-medium">Total Games</p>
                  <h3 className="text-4xl font-extrabold">{category.total_games || 0}</h3>
                </div>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-6">
                <div className="h-full bg-white rounded-full w-3/4"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Metadata</h3>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                <li className="flex justify-between items-center p-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Featured Status</span>
                  {category.is_featured ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">Featured</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400 text-xs font-bold uppercase">Standard</span>
                  )}
                </li>
                <li className="flex justify-between items-center p-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Display Order</span>
                  <span className="font-bold text-slate-900 dark:text-white">{category.display_order}</span>
                </li>
                <li className="flex justify-between items-center p-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Created Date</span>
                  <span className="text-slate-900 dark:text-white font-medium text-sm">
                    {category.created_at ? format(new Date(category.created_at), "MMM dd, yyyy") : "—"}
                  </span>
                </li>
                <li className="flex justify-between items-center p-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Last Updated</span>
                  <span className="text-slate-900 dark:text-white font-medium text-sm">
                    {category.updated_at ? format(new Date(category.updated_at), "MMM dd, yyyy") : "—"}
                  </span>
                </li>
                <li className="flex justify-between items-center p-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Category ID</span>
                  <span className="font-mono text-slate-500 text-xs">{category.id}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
