"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar, Edit, Camera, Key, X, CheckCircle, AlertCircle, Loader2, Phone, Trash2 } from "lucide-react";
import { api } from "@/lib/axios";
import { QRCodeSVG } from "qrcode.react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
    return `${baseUrl}${url}`;
  };

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  
  // Forms state
  const [profileForm, setProfileForm] = useState({ username: "", email: "", mobile: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [twoFactorData, setTwoFactorData] = useState({ secret: "", uri: "", code: "" });
  
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      setProfileForm({
        username: response.data.username || "",
        email: response.data.email || "",
        mobile: response.data.mobile || ""
      });
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadResponse = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const avatarUrl = uploadResponse.data.url;
      
      await api.put("/auth/me", { avatar_url: avatarUrl });
      
      setUser((prev: any) => ({ ...prev, avatar_url: avatarUrl }));
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to update profile picture");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    
    setUploadingAvatar(true);
    try {
      await api.put("/auth/me", { remove_avatar: true });
      setUser((prev: any) => ({ ...prev, avatar_url: null }));
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to remove profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg({ type: "", text: "" });
    try {
      await api.put("/auth/me", profileForm);
      setMsg({ type: "success", text: "Profile updated successfully" });
      await fetchUser();
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setMsg({ type: "", text: "" });
      }, 1500);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.detail || "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    
    setIsSubmitting(true);
    setMsg({ type: "", text: "" });
    try {
      await api.post("/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setMsg({ type: "success", text: "Password updated successfully" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        setMsg({ type: "", text: "" });
      }, 2000);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.detail || "Failed to update password" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const init2FASetup = async () => {
    setIsSubmitting(true);
    setMsg({ type: "", text: "" });
    try {
      const response = await api.post("/auth/2fa/setup");
      setTwoFactorData(prev => ({ ...prev, secret: response.data.secret, uri: response.data.uri }));
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.detail || "Failed to initiate 2FA setup" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg({ type: "", text: "" });
    try {
      await api.post("/auth/2fa/verify", { code: twoFactorData.code });
      setMsg({ type: "success", text: "2FA enabled successfully" });
      await fetchUser();
      setTimeout(() => {
        setIs2FAModalOpen(false);
        setTwoFactorData({ secret: "", uri: "", code: "" });
        setMsg({ type: "", text: "" });
      }, 2000);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.detail || "Invalid code" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FADisable = async () => {
    const code = prompt("Enter your 6-digit 2FA code to disable:");
    if (!code) return;
    
    try {
      await api.post("/auth/2fa/disable", { code });
      alert("2FA disabled successfully");
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to disable 2FA");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account details and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl overflow-hidden rounded-2xl">
            <div className="h-32 bg-gradient-to-r from-red-900 via-red-800 to-red-950 relative">
              <button 
                onClick={() => { setMsg({type: "", text: ""}); setIsEditProfileOpen(true); }}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="flex justify-center -mt-16 mb-4">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-white dark:border-[#111111] bg-gradient-to-tr from-amber-400 to-orange-500 p-1 shadow-lg">
                    <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      {user?.avatar_url ? (
                        <img src={getImageUrl(user.avatar_url)} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-amber-400 capitalize">
                          {(user?.username || user?.email || "A")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-1 right-1 p-2 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-lg transition-colors border-2 border-white dark:border-[#111111]"
                  >
                    {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  {user?.avatar_url && (
                    <button 
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      title="Remove Picture"
                      className="absolute bottom-1 left-1 p-2 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg transition-colors border-2 border-white dark:border-[#111111]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>
              
              <div className="text-center space-y-1 mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {user?.username || user?.email?.split('@')[0] || "Admin User"}
                </h3>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  {user?.role || "Super Admin"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 pt-1">
                  {user?.email || "admin@bullwave.com"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-white/5">
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                  <p className="text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Active
                  </p>
                </div>
                <div className="text-center border-l border-slate-100 dark:border-white/5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Joined</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-1">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Jan 2024"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details and Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-amber-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Username</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <User className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {user?.username || user?.email?.split('@')[0] || "Not Provided"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {user?.email || "Not Provided"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {user?.mobile || "Not Provided"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Account Role</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <Shield className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {user?.role || "Super Admin"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Member Since</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "January 2024"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl rounded-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Change Password</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <button 
                  onClick={() => { setMsg({type: "", text: ""}); setIsPasswordModalOpen(true); }}
                  className="px-5 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Update Password
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                    Two-Factor Authentication
                    {user?.is_2fa_enabled ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Enabled</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">Recommended</span>
                    )}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add additional security to your account using two factor authentication.</p>
                </div>
                {user?.is_2fa_enabled ? (
                  <button 
                    onClick={handle2FADisable}
                    className="px-5 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 font-medium transition-colors whitespace-nowrap"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button 
                    onClick={() => { 
                      setMsg({type: "", text: ""}); 
                      setIs2FAModalOpen(true); 
                      init2FASetup(); 
                    }}
                    className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white hover:bg-slate-800 dark:hover:bg-amber-600 font-medium shadow-md transition-colors whitespace-nowrap"
                  >
                    Enable 2FA
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {msg.text && (
                <div className={`p-3 rounded-xl flex items-center gap-2 mb-4 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {msg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {msg.text}
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                  <input 
                    type="text" 
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({...prev, username: e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm(prev => ({...prev, mobile: e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Change Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {msg.text && (
                <div className={`p-3 rounded-xl flex items-center gap-2 mb-4 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {msg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {msg.text}
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({...prev, current_password: e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({...prev, new_password: e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm(prev => ({...prev, confirm_password: e.target.value}))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Setup Two-Factor Authentication</h3>
              <button onClick={() => setIs2FAModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {msg.text && (
                <div className={`p-3 rounded-xl flex items-center gap-2 mb-4 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {msg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {msg.text}
                </div>
              )}
              
              {!twoFactorData.uri ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Scan the QR code below with your Google Authenticator or Authy app.
                  </p>
                  
                  <div className="flex justify-center p-4 bg-white rounded-xl mx-auto w-max shadow-sm border border-slate-100">
                    <QRCodeSVG value={twoFactorData.uri} size={180} />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Manual Entry Code</p>
                    <p className="font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200">{twoFactorData.secret}</p>
                  </div>
                  
                  <form onSubmit={handle2FAVerify} className="space-y-4 pt-2">
                    <div>
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={twoFactorData.code}
                        onChange={(e) => setTwoFactorData(prev => ({...prev, code: e.target.value.replace(/[^0-9]/g, '')}))}
                        className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || twoFactorData.code.length !== 6}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Enable 2FA"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
