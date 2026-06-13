"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, X, Check, Loader2, Edit, Image as ImageIcon, FileImage, Settings2, Info, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";

const gameSchema = z.object({
  name: z.string().min(2, "Game name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  category_id: z.coerce.number().min(1, "Category is required"),
  provider_id: z.coerce.number().optional(),
  min_bet: z.coerce.number().min(0, "Min bet must be non-negative"),
  max_bet: z.coerce.number().min(0, "Max bet must be non-negative"),
  default_bet: z.coerce.number().optional(),
  rtp_percentage: z.coerce.number().optional(),
  status: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  is_new: z.boolean().default(true),
  game_code: z.string().optional(),
  launch_url: z.string().optional(),
  api_endpoint: z.string().optional(),
  version: z.string().optional(),
});

type GameFormValues = z.infer<typeof gameSchema>;

export function EditGameModal({ game }: { game: any }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(game.thumbnail ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + game.thumbnail : null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(game.banner ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + game.banner : null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["game-categories"],
    queryFn: async () => (await api.get("/game-categories/")).data,
  });

  const { data: providers } = useQuery({
    queryKey: ["game-providers"],
    queryFn: async () => (await api.get("/game-providers/")).data,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema) as any,
    defaultValues: {
      name: game.name || "",
      slug: game.slug || "",
      short_description: game.short_description || "",
      description: game.description || "",
      category_id: game.category_id,
      provider_id: game.provider_id,
      min_bet: game.min_bet ?? 0,
      max_bet: game.max_bet ?? 1000,
      default_bet: game.default_bet,
      rtp_percentage: game.rtp_percentage,
      status: game.status ?? true,
      is_featured: game.is_featured ?? false,
      is_trending: game.is_trending ?? false,
      is_new: game.is_new ?? false,
      game_code: game.game_code || "",
      launch_url: game.launch_url || "",
      api_endpoint: game.api_endpoint || "",
      version: game.version || "",
    },
  });

  const watchName = watch("name");

  // Auto-generate slug
  useEffect(() => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchName, setValue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "thumbnail") {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/uploads/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put(`/games/${game.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game updated successfully!");
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update game");
    },
  });

  const onSubmit = async (data: GameFormValues) => {
    toast.info("Saving game...");
    try {
      let thumbnail_url = "";
      let banner_url = "";

      if (thumbnailFile) {
        thumbnail_url = await uploadMutation.mutateAsync(thumbnailFile);
      }
      if (bannerFile) {
        banner_url = await uploadMutation.mutateAsync(bannerFile);
      }

      const payload: any = { ...data };
      if (thumbnail_url) payload.thumbnail = thumbnail_url;
      if (banner_url) payload.banner_image = banner_url;
      if (!payload.provider_id) payload.provider_id = null;

      await updateGameMutation.mutateAsync(payload);
    } catch (e) {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors mr-2">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-4xl w-[95vw] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/10 p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edit Game: {game.name}</DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update configuration for this game.</p>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="edit-game-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-10">
            
            {/* Section: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <Info className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Game Name <span className="text-red-500">*</span>
                  </label>
                  <input {...register("name")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm" placeholder="e.g. Crazy Time" />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input {...register("slug")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm" placeholder="crazy-time" />
                  {errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug.message}</p>}
                </div>
              </div>
            </div>

            {/* Section: Categorization */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <Settings2 className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Categorization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select {...register("category_id")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm appearance-none">
                    <option value="">Select a Category</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#111111]">{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-xs text-red-500 font-medium">{errors.category_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Provider
                  </label>
                  <select {...register("provider_id")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm appearance-none">
                    <option value="">Select a Provider</option>
                    {providers?.map((prov: any) => (
                      <option key={prov.id} value={prov.id} className="bg-white dark:bg-[#111111]">{prov.name}</option>
                    ))}
                  </select>
                  {errors.provider_id && <p className="text-xs text-red-500 font-medium">{errors.provider_id.message}</p>}
                </div>
              </div>
            </div>

            {/* Section: Betting Configuration */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Betting Configuration</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Min Bet <span className="text-red-500">*</span>
                  </label>
                  <input type="number" step="0.01" {...register("min_bet")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm" />
                  {errors.min_bet && <p className="text-xs text-red-500 font-medium">{errors.min_bet.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Max Bet <span className="text-red-500">*</span>
                  </label>
                  <input type="number" step="0.01" {...register("max_bet")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm" />
                  {errors.max_bet && <p className="text-xs text-red-500 font-medium">{errors.max_bet.message}</p>}
                </div>
              </div>
            </div>

            {/* Section: Media */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <FileImage className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Media</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Thumbnail Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Game Thumbnail</label>
                  <label className="block w-full cursor-pointer group">
                    <div className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all bg-slate-50 dark:bg-white/5 ${thumbnailPreview ? 'border-amber-500' : 'border-slate-300 dark:border-white/20 hover:border-amber-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                      {thumbnailPreview ? (
                        <div className="absolute inset-0">
                          <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="h-12 w-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-300" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload thumbnail</p>
                          <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
                        </div>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "thumbnail")} />
                  </label>
                </div>

                {/* Banner Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Game Banner</label>
                  <label className="block w-full cursor-pointer group">
                    <div className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all bg-slate-50 dark:bg-white/5 ${bannerPreview ? 'border-amber-500' : 'border-slate-300 dark:border-white/20 hover:border-amber-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                      {bannerPreview ? (
                        <div className="absolute inset-0">
                          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="h-12 w-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-300" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload banner</p>
                          <p className="text-xs text-slate-500 mt-1">1920x1080 recommended</p>
                        </div>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "banner")} />
                  </label>
                </div>
              </div>
            </div>

            {/* Section: Display Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <Settings2 className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Display Settings</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="pt-0.5">
                    <input type="checkbox" {...register("status")} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Active Game</p>
                    <p className="text-xs text-slate-500 mt-0.5">Visible to users</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="pt-0.5">
                    <input type="checkbox" {...register("is_featured")} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Featured</p>
                    <p className="text-xs text-slate-500 mt-0.5">Show in hero section</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="pt-0.5">
                    <input type="checkbox" {...register("is_trending")} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Trending</p>
                    <p className="text-xs text-slate-500 mt-0.5">Add trending badge</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="pt-0.5">
                    <input type="checkbox" {...register("is_new")} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">New Release</p>
                    <p className="text-xs text-slate-500 mt-0.5">Add new badge</p>
                  </div>
                </label>
              </div>
            </div>

          </form>
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a] px-8 py-4 shrink-0 flex items-center justify-end gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-game-form"
            disabled={updateGameMutation.isPending || uploadMutation.isPending}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(updateGameMutation.isPending || uploadMutation.isPending) ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Check className="h-4 w-4" /> Save Changes</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
