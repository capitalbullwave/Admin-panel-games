"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, GripVertical, Settings2, Trash2, Loader2, Search, Filter, Eye, Star, Power, Gamepad2, Activity, LayoutDashboard, SearchX } from "lucide-react";
import { api } from "@/lib/axios";
import { AddCategoryModal } from "@/components/games/AddCategoryModal";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  thumbnail_url: string | null;
  color_code: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  total_games: number;
  created_at: string;
}

export default function GameCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["game-categories"],
    queryFn: async () => {
      const res = await api.get("/game-categories/");
      return res.data as Category[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/game-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-categories"] });
      toast.success("Category deleted successfully");
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete category");
      setDeleteConfirmId(null);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/game-categories/${id}/status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-categories"] });
      toast.success("Status updated");
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/game-categories/${id}/feature`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-categories"] });
      toast.success("Featured status updated");
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!categories) return { total: 0, active: 0, inactive: 0, featured: 0 };
    return {
      total: categories.length,
      active: categories.filter(c => c.is_active).length,
      inactive: categories.filter(c => !c.is_active).length,
      featured: categories.filter(c => c.is_featured).length,
    };
  }, [categories]);

  // Filter data
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" ? true : filterStatus === "active" ? c.is_active : !c.is_active;
      const matchesFeatured = filterFeatured === "all" ? true : c.is_featured;
      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [categories, searchTerm, filterStatus, filterFeatured]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Category Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organize games into categories for the frontend application.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddCategoryModal />
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Categories</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Categories</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-500/10 rounded-xl text-slate-500">
              <Power className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Inactive Categories</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Featured Categories</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.featured}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] focus:outline-none text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select 
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] focus:outline-none text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Features</option>
                <option value="featured">Featured Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No categories found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-center">Total Games</th>
                    <th className="px-6 py-4 text-center">Order</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md overflow-hidden bg-slate-100 dark:bg-white/10"
                            style={cat.color_code ? { backgroundColor: cat.color_code } : {}}
                          >
                            {cat.icon ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold">{cat.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">{cat.slug}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-bold text-sm">
                          {cat.total_games || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                        {cat.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => toggleStatusMutation.mutate(cat.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                          cat.is_active 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20" 
                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
                        }`}>
                          {cat.is_active ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => toggleFeatureMutation.mutate(cat.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            cat.is_featured 
                              ? "bg-amber-500/20 text-amber-500" 
                              : "text-slate-300 dark:text-slate-600 hover:text-amber-500"
                          }`}
                        >
                          <Star className={`w-5 h-5 ${cat.is_featured ? "fill-amber-500" : ""}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/games/categories/${cat.id}`}>
                            <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          {/* We don't have Edit Modal yet, but leaving button for future */}
                          <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(cat.id)} 
                            disabled={deleteMutation.isPending && deleteConfirmId === cat.id}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white text-center">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8" />
            </div>
          </div>
          <DialogFooter className="flex sm:justify-center gap-2">
            <button 
              onClick={() => setDeleteConfirmId(null)}
              className="px-6 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (deleteConfirmId) {
                  deleteMutation.mutate(deleteConfirmId);
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 font-bold transition-all disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="h-4 w-4" /> Delete</>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
