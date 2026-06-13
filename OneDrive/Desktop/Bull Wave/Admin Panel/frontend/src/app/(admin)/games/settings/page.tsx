"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { api } from "@/lib/axios";
import { useState, useEffect } from "react";

export default function GameSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    maintenance_mode: false,
    default_currency: "USD",
    min_deposit: 10,
    max_deposit: 10000,
    default_commission: 5,
    default_rtp: 95,
    allowed_countries: "US,UK,CA,IN"
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["game-settings"],
    queryFn: async () => {
      const res = await api.get("/game-settings/");
      return res.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        maintenance_mode: settings.maintenance_mode,
        default_currency: settings.default_currency,
        min_deposit: settings.min_deposit,
        max_deposit: settings.max_deposit,
        default_commission: settings.default_commission,
        default_rtp: settings.default_rtp,
        allowed_countries: settings.allowed_countries || "US,UK,CA,IN"
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put("/game-settings/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-settings"] });
      alert("Settings updated successfully");
    },
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Game Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure global game parameters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all disabled:opacity-50">
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Global Configuration</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Currency</label>
                <input 
                  type="text" name="default_currency" value={formData.default_currency} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Commission (%)</label>
                <input 
                  type="number" name="default_commission" value={formData.default_commission} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Deposit</label>
                <input 
                  type="number" name="min_deposit" value={formData.min_deposit} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Deposit</label>
                <input 
                  type="number" name="max_deposit" value={formData.max_deposit} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default RTP (%)</label>
                <input 
                  type="number" name="default_rtp" value={formData.default_rtp} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Allowed Countries (Comma separated)</label>
                <input 
                  type="text" name="allowed_countries" value={formData.allowed_countries} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2 pt-4 border-t border-slate-100 dark:border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" name="maintenance_mode" checked={formData.maintenance_mode} onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Maintenance Mode</span>
                </label>
                <p className="text-xs text-slate-500 ml-8">Enabling this will prevent users from accessing the games.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
