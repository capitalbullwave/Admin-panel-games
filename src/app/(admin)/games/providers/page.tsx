"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, GripVertical, Settings2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/axios";

export default function GameProvidersPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["game-providers"],
    queryFn: async () => {
      const res = await api.get("/game-providers/");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/game-providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-providers"] });
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Game Providers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage game providers and their details.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add Provider
          </button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden max-w-4xl">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Available Providers</p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {providers?.length === 0 && (
                <li className="p-4 text-center text-slate-500">No providers found.</li>
              )}
              {providers?.map((provider: any) => (
                <li key={provider.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 dark:bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {provider.logo ? (
                            <img src={provider.logo} alt={provider.name} className="h-full w-full object-cover" />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{provider.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">{provider.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      provider.status 
                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                        : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                    }`}>
                      {provider.status ? "Active" : "Inactive"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(provider.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
