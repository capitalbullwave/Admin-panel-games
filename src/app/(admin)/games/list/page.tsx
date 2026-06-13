"use client";

import { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Filter, MoreVertical, Edit, Power, PowerOff, Loader2, LayoutDashboard, Activity, Star, SearchX, Trash2, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { AddGameModal } from "@/components/games/AddGameModal";
import { EditGameModal } from "@/components/games/EditGameModal";

export default function GameListPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: games, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const res = await api.get("/games/");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game deleted successfully");
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete game");
      setDeleteConfirmId(null);
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!games) return { total: 0, active: 0, inactive: 0, featured: 0 };
    return {
      total: games.length,
      active: games.filter((g: any) => g.status).length,
      inactive: games.filter((g: any) => !g.status).length,
      featured: games.filter((g: any) => g.is_featured).length,
    };
  }, [games]);

  // Filter data
  const filteredGames = useMemo(() => {
    if (!games) return [];
    return games.filter((g: any) => {
      const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" ? true : filterStatus === "active" ? g.status : !g.status;
      const matchesFeatured = filterFeatured === "all" ? true : g.is_featured;
      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [games, searchTerm, filterStatus, filterFeatured]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Game List</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all available games on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddGameModal />
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
              <p className="text-sm font-medium text-slate-500">Total Games</p>
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
              <p className="text-sm font-medium text-slate-500">Active Games</p>
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
              <p className="text-sm font-medium text-slate-500">Inactive Games</p>
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
              <p className="text-sm font-medium text-slate-500">Featured Games</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.featured}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search games..." 
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
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No games found</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Game Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold text-right">Min/Max Bet</th>
                    <th className="px-6 py-4 font-semibold text-center">Featured</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredGames.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                            {row.thumbnail ? (
                              <img 
                                src={row.thumbnail.startsWith('http') ? row.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${row.thumbnail}`} 
                                alt={row.name} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-xs font-semibold">{row.category?.name || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-bold text-right">${row.min_bet} - ${row.max_bet}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-center">
                        {row.is_featured ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max gap-1 ${
                          row.status 
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {row.status ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                          {row.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <EditGameModal game={row} />
                          <button 
                            onClick={() => setDeleteConfirmId(row.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Game"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111]">
            <span className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredGames.length} games</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md w-[95vw] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white text-center">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete this game? This action cannot be undone.
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
