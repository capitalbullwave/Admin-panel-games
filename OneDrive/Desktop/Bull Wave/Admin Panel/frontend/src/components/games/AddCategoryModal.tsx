"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Loader2, Plus, Settings2, Image as ImageIcon, Layout, Type, Palette } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters").max(100),
  slug: z.string().min(3, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase and contain no spaces"),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail_url: z.string().optional(),
  banner_url: z.string().optional(),
  color_code: z.string().optional(),
  display_order: z.coerce.number().min(0, "Display order must be positive").default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function AddCategoryModal() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      is_active: true,
      is_featured: false,
      display_order: 0,
      color_code: "#f59e0b",
      icon: "",
      thumbnail_url: "",
      banner_url: "",
    },
  });

  const watchName = watch("name");

  // Auto-generate slug
  useEffect(() => {
    if (watchName && !isOpen) return; // Prevent overwriting if they manually edit
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchName, setValue, isOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      await api.post("/game-categories/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-categories"] });
      toast.success("Category created successfully!");
      setIsOpen(false);
      reset();
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;
      if (detail && typeof detail === "string" && detail.toLowerCase().includes("already exists")) {
        setError("name", { type: "manual", message: detail });
        setError("slug", { type: "manual", message: detail });
      } else {
        toast.error(detail || "Failed to create category");
      }
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all">
        <Plus className="h-4 w-4" />
        Add Category
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl w-[95vw] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/10 p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Add Category</DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a new category to group games across the platform.</p>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
          <form id="add-category-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-10">
            
            {/* Section: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <Type className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input {...register("name")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm" placeholder="e.g. Slots" />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input {...register("slug")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white transition-all shadow-sm" placeholder="slots" />
                  {errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug.message}</p>}
                </div>
              </div>
            </div>

            {/* Section: Media */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Media</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Controller
                    control={control}
                    name="icon"
                    render={({ field }) => (
                      <ImageUpload 
                        label="Category Icon" 
                        description="Square ratio (1:1)"
                        value={field.value || ""} 
                        onChange={field.onChange} 
                      />
                    )}
                  />
                </div>
                <div className="space-y-6 pt-6">
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="pt-0.5">
                      <input type="checkbox" {...register("is_active")} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Active Category</p>
                      <p className="text-xs text-slate-500 mt-0.5">Category will be visible to users</p>
                    </div>
                  </label>
                </div>
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
            form="add-category-form"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Check className="h-4 w-4" /> Create Category</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
