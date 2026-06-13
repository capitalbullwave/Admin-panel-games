"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Settings2, ShieldCheck, CreditCard, Gift, Gamepad2, Bell, UserPlus, PhoneCall, FileText, Server, AlertTriangle, Save, RotateCcw, Activity, Info, Upload } from "lucide-react";
import * as api from "@/lib/api/settings";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// Define categories and their fields
const CATEGORIES = [
  { id: "General Settings", icon: Settings2 },
  { id: "Referral Settings", icon: UserPlus },
  { id: "KYC Settings", icon: ShieldCheck },
  { id: "Wallet Settings", icon: CreditCard },
  { id: "Payment Settings", icon: CreditCard },
  { id: "Bonus Settings", icon: Gift },
  { id: "Game Settings", icon: Gamepad2 },
  { id: "Security Settings", icon: ShieldCheck },
  { id: "Notification Settings", icon: Bell },
  { id: "Registration Settings", icon: UserPlus },
  { id: "Support Settings", icon: PhoneCall },
  { id: "Tax & Compliance", icon: FileText },
  { id: "System Configuration", icon: Server },
  { id: "Maintenance Settings", icon: AlertTriangle },
];

const CATEGORY_SCHEMAS: Record<string, { key: string; label: string; type: string; placeholder?: string; description?: string; options?: string[] }[]> = {
  "General Settings": [
    { key: "Platform Name", label: "Platform Name", type: "text", placeholder: "Bull Wave Capital" },
    { key: "Platform Logo", label: "Platform Logo", type: "file" },
    { key: "Favicon", label: "Favicon", type: "text", placeholder: "/favicon.ico" },
    { key: "Company Name", label: "Company Name", type: "text" },
    { key: "Support Email", label: "Support Email", type: "email" },
    { key: "Support Phone", label: "Support Phone", type: "text" },
    { key: "Company Address", label: "Company Address", type: "text" },
    { key: "Timezone", label: "Timezone", type: "select", options: ["UTC", "Asia/Kolkata", "America/New_York"] },
    { key: "Currency", label: "Currency", type: "select", options: ["INR", "USD", "EUR"] },
    { key: "Language", label: "Language", type: "select", options: ["English", "Hindi"] },
    { key: "Date Format", label: "Date Format", type: "select", options: ["YYYY-MM-DD", "DD/MM/YYYY"] },
  ],
  "Referral Settings": [
    { key: "Referral Enable", label: "Enable Referrals", type: "toggle" },
    { key: "Referral Signup Bonus", label: "Signup Bonus", type: "number" },
    { key: "Level 1 Commission", label: "Level 1 Commission (%)", type: "number" },
    { key: "Level 2 Commission", label: "Level 2 Commission (%)", type: "number" },
    { key: "Level 3 Commission", label: "Level 3 Commission (%)", type: "number" },
    { key: "Max Referral Earnings", label: "Max Earnings", type: "number" },
    { key: "Referral Withdrawal Rules", label: "Withdrawal Rules", type: "textarea" },
  ],
  "KYC Settings": [
    { key: "KYC Mandatory", label: "KYC Mandatory", type: "toggle" },
    { key: "PAN Verification Required", label: "PAN Verification Required", type: "toggle" },
    { key: "Aadhaar Verification Required", label: "Aadhaar Verification Required", type: "toggle" },
    { key: "Bank Verification Required", label: "Bank Verification Required", type: "toggle" },
    { key: "Auto Approval", label: "Auto Approval", type: "toggle" },
    { key: "KYC Expiry Days", label: "Expiry Days", type: "number" },
  ],
  "Wallet Settings": [
    { key: "Minimum Deposit", label: "Minimum Deposit", type: "number" },
    { key: "Maximum Deposit", label: "Maximum Deposit", type: "number" },
    { key: "Minimum Withdrawal", label: "Minimum Withdrawal", type: "number" },
    { key: "Maximum Withdrawal", label: "Maximum Withdrawal", type: "number" },
    { key: "Daily Withdrawal Limit", label: "Daily Withdrawal Limit", type: "number" },
    { key: "Withdrawal Fee", label: "Withdrawal Fee (%)", type: "number" },
    { key: "Wallet Bonus Expiry", label: "Bonus Expiry (Days)", type: "number" },
  ],
  "Payment Settings": [
    { key: "Razorpay", label: "Razorpay Configuration (JSON)", type: "textarea", placeholder: '{"enabled": true, "merchant_id": ""}' },
    { key: "Cashfree", label: "Cashfree Configuration (JSON)", type: "textarea", placeholder: '{"enabled": false, "merchant_id": ""}' },
    { key: "PhonePe", label: "PhonePe Configuration (JSON)", type: "textarea", placeholder: '{"enabled": false, "merchant_id": ""}' },
    { key: "Paytm", label: "Paytm Configuration (JSON)", type: "textarea", placeholder: '{"enabled": false, "merchant_id": ""}' },
  ],
  "Bonus Settings": [
    { key: "Signup Bonus", label: "Signup Bonus Amount", type: "number" },
    { key: "First Deposit Bonus", label: "First Deposit Bonus (%)", type: "number" },
    { key: "Daily Login Bonus", label: "Daily Login Bonus", type: "number" },
    { key: "Cashback Percentage", label: "Cashback Percentage", type: "number" },
    { key: "Welcome Bonus", label: "Welcome Bonus Code", type: "text" },
  ],
  "Game Settings": [
    { key: "Enable Games", label: "Enable Games Platform", type: "toggle" },
    { key: "Minimum Bet Amount", label: "Minimum Bet Amount", type: "number" },
    { key: "Maximum Bet Amount", label: "Maximum Bet Amount", type: "number" },
    { key: "Result Delay", label: "Result Delay (Seconds)", type: "number" },
    { key: "Auto Settlement", label: "Auto Settlement", type: "toggle" },
    { key: "Default Game Visibility", label: "Default Game Visibility", type: "toggle" },
  ],
  "Security Settings": [
    { key: "Login Attempt Limit", label: "Login Attempt Limit", type: "number" },
    { key: "Account Lock Duration", label: "Account Lock Duration (Minutes)", type: "number" },
    { key: "Password Length", label: "Min Password Length", type: "number" },
    { key: "Session Timeout", label: "Session Timeout (Minutes)", type: "number" },
    { key: "Enable 2FA", label: "Enable 2FA globally", type: "toggle" },
    { key: "Device Verification", label: "Device Verification", type: "toggle" },
    { key: "IP Whitelist", label: "Admin IP Whitelist", type: "text" },
  ],
  "Notification Settings": [
    { key: "Email Notifications", label: "Email Notifications", type: "toggle" },
    { key: "SMS Notifications", label: "SMS Notifications", type: "toggle" },
    { key: "Push Notifications", label: "Push Notifications", type: "toggle" },
    { key: "Telegram Alerts", label: "Telegram Alerts", type: "toggle" },
    { key: "Admin Alerts", label: "Admin Alerts", type: "toggle" },
  ],
  "Registration Settings": [
    { key: "Registration Enabled", label: "Registration Enabled", type: "toggle" },
    { key: "Mobile Verification", label: "Mobile Verification", type: "toggle" },
    { key: "Email Verification", label: "Email Verification", type: "toggle" },
    { key: "Invite Code Required", label: "Invite Code Required", type: "toggle" },
    { key: "Age Restriction", label: "Min Age Restriction", type: "number" },
  ],
  "Support Settings": [
    { key: "WhatsApp Number", label: "WhatsApp Number", type: "text" },
    { key: "Telegram URL", label: "Telegram URL", type: "text" },
    { key: "Support Email", label: "Support Email", type: "email" },
    { key: "Ticket System", label: "Ticket System Enabled", type: "toggle" },
    { key: "Live Chat Enable", label: "Live Chat Enable", type: "toggle" },
  ],
  "Tax & Compliance": [
    { key: "GST Percentage", label: "GST Percentage", type: "number" },
    { key: "TDS Percentage", label: "TDS Percentage", type: "number" },
    { key: "PAN Mandatory Threshold", label: "PAN Mandatory Threshold (Amount)", type: "number" },
    { key: "Withdrawal Tax Rules", label: "Withdrawal Tax Rules", type: "textarea" },
  ],
  "System Configuration": [
    { key: "Frontend URL", label: "Frontend URL", type: "text" },
    { key: "Admin URL", label: "Admin URL", type: "text" },
    { key: "API URL", label: "API URL", type: "text" },
    { key: "CDN URL", label: "CDN URL", type: "text" },
    { key: "Storage Provider", label: "Storage Provider", type: "select", options: ["local", "AWS S3", "Cloudinary"] },
    { key: "Backup Schedule", label: "Backup Schedule", type: "select", options: ["Daily", "Weekly", "Monthly"] },
  ],
  "Maintenance Settings": [
    { key: "Maintenance Mode", label: "Enable Maintenance Mode", type: "toggle" },
    { key: "Maintenance Message", label: "Maintenance Message", type: "textarea" },
    { key: "Start Time", label: "Start Time", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
    { key: "End Time", label: "End Time", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
    { key: "Allowed Admin IPs", label: "Allowed Admin IPs (Comma separated)", type: "text" },
  ]
};

export default function SettingsDashboard() {
  const [activeCategory, setActiveCategory] = useState("General Settings");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch settings for active category
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", activeCategory],
    queryFn: () => api.getSettingsByCategory(activeCategory),
  });

  // Fetch all categories count or stats
  const { data: allCategories } = useQuery<any[]>({
    queryKey: ["settings", "categories"],
    queryFn: () => api.getSettingsCategories() as unknown as any[],
  });

  // Populate form data
  useEffect(() => {
    if (settings) {
      const newFormData: Record<string, any> = {};
      settings.forEach((s) => {
        newFormData[s.setting_key] = s.setting_value === "true" ? true : s.setting_value === "false" ? false : s.setting_value;
      });
      setFormData(newFormData);
      setHasUnsavedChanges(false);
    }
  }, [settings, activeCategory]);

  const updateMutation = useMutation({
    mutationFn: (data: api.SettingsCategoryUpdate) => api.updateSettingsByCategory(activeCategory, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully");
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update settings");
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadPlatformLogo(file),
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, "Platform Logo": data.setting_value }));
      toast.success("Logo uploaded successfully");
      setIsUploading(false);
    },
    onError: () => {
      toast.error("Failed to upload logo");
      setIsUploading(false);
    }
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleSave = () => {
    // Stringify boolean values for the API
    const dataToSave: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
        if (typeof formData[key] === "boolean") {
            dataToSave[key] = formData[key] ? "true" : "false";
        } else {
            dataToSave[key] = formData[key] !== null ? String(formData[key]) : "";
        }
    });
    
    if (activeCategory === "Wallet Settings") {
      const minDep = parseFloat(dataToSave["Minimum Deposit"]);
      const maxDep = parseFloat(dataToSave["Maximum Deposit"]);
      if (minDep >= maxDep) {
        toast.error("Minimum Deposit must be less than Maximum Deposit");
        return;
      }
      const minWith = parseFloat(dataToSave["Minimum Withdrawal"]);
      const maxWith = parseFloat(dataToSave["Maximum Withdrawal"]);
      if (minWith >= maxWith) {
        toast.error("Minimum Withdrawal must be less than Maximum Withdrawal");
        return;
      }
    }

    updateMutation.mutate({ settings: dataToSave });
  };

  const handleReset = () => {
    if (settings) {
      const newFormData: Record<string, any> = {};
      settings.forEach((s) => {
        newFormData[s.setting_key] = s.setting_value === "true" ? true : s.setting_value === "false" ? false : s.setting_value;
      });
      setFormData(newFormData);
      setHasUnsavedChanges(false);
      toast.info("Settings reset to last saved state");
    }
  };

  const fields = CATEGORY_SCHEMAS[activeCategory] || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Categories</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{CATEGORIES.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Settings2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Maintenance Status</p>
                <h3 className="text-xl font-bold text-emerald-500 mt-1">Operational</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Gateways</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Updated</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">General Settings</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <Card className="w-full lg:w-64 shrink-0 border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden h-fit">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
            <h3 className="font-semibold text-slate-900 dark:text-white">Configuration Center</h3>
          </div>
          <div className="p-2 space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const catStatus = allCategories?.find(c => c.name === cat.id)?.status;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${activeCategory === cat.id ? "text-amber-500" : ""}`} />
                    {cat.id.replace("Settings", "").trim()}
                  </div>
                  {catStatus && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      catStatus === 'Configured' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'
                    }`}>
                      {catStatus === 'Configured' ? '✓' : '!'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Settings Content Area */}
        <Card className="flex-1 border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{activeCategory}</h2>
                {(() => {
                  const s = allCategories?.find(c => c.name === activeCategory)?.status;
                  if (!s) return null;
                  return (
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      s === 'Configured' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                       : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    }`}>
                      {s}
                    </span>
                  );
                })()}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage configuration for {activeCategory.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset}
                disabled={!hasUnsavedChanges || updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {hasUnsavedChanges && (
              <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-600 dark:text-amber-400 text-sm">
                <Info className="h-5 w-5" />
                <p>You have unsaved changes. Remember to save before navigating away.</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : fields.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No configuration fields defined for this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fields.map((field) => {
                  const isEmpty = formData[field.key] === "" || formData[field.key] === null || formData[field.key] === undefined;
                  
                  return (
                    <div key={field.key} className={`space-y-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {field.label}
                          {isEmpty && field.type !== 'toggle' && (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase">
                              Not Configured
                            </span>
                          )}
                        </Label>
                      </div>

                      {field.type === "text" || field.type === "number" || field.type === "email" ? (
                        <input
                          type={field.type}
                          placeholder={field.placeholder || "Not configured"}
                          value={formData[field.key] || ""}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className={`w-full px-3 py-2 rounded-md bg-white dark:bg-black/20 border ${isEmpty ? 'border-orange-500/30' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                        />
                      ) : field.type === "password" ? (
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={formData[field.key] || ""}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className={`w-full px-3 py-2 rounded-md bg-white dark:bg-black/20 border ${isEmpty ? 'border-orange-500/30' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                        />
                      ) : field.type === "textarea" ? (
                        <textarea
                          rows={4}
                          placeholder={field.placeholder || "Not configured"}
                          value={formData[field.key] || ""}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className={`w-full px-3 py-2 rounded-md bg-white dark:bg-black/20 border ${isEmpty ? 'border-orange-500/30' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono`}
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={formData[field.key] || ""}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className={`w-full px-3 py-2 rounded-md bg-white dark:bg-black/20 border ${isEmpty ? 'border-orange-500/30' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                        >
                          <option value="">Not Configured</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === "toggle" ? (
                        <div className="flex items-center h-[38px]">
                          <button
                            type="button"
                            onClick={() => handleInputChange(field.key, !formData[field.key])}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-[#111111] ${
                              formData[field.key] ? "bg-amber-500" : "bg-slate-200 dark:bg-white/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                formData[field.key] ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">
                            {formData[field.key] ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      ) : field.type === "file" ? (
                        <div className="flex items-center gap-4">
                          {formData[field.key] && (
                            <div className="h-12 w-12 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-black/20 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={formData[field.key]} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                          <label className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-sm font-medium cursor-pointer transition-colors">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {isUploading ? "Uploading..." : "Upload Image"}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                          </label>
                        </div>
                      ) : null}
                      
                      {field.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
