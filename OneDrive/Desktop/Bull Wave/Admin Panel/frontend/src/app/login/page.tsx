"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/axios";
import { 
  ShieldCheck, 
  Zap, 
  Star, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  KeyRound
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  totp_code: z.string().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      totp_code: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setError(null);
      const formData = new URLSearchParams();
      formData.append("username", values.username);
      formData.append("password", values.password);
      if (requires2FA && values.totp_code) {
        formData.append("totp_code", values.totp_code);
      }

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.status === 401 && err.response?.data?.detail === "2FA_REQUIRED") {
        setRequires2FA(true);
        setError(null);
      } else {
        setError(err.response?.data?.detail || "An error occurred during login.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-[#4a0000] via-[#800000] to-[#5a0000] items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/20 rounded-2xl blur-xl" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-[#800000]/40 rounded-2xl backdrop-blur-md border border-[#600000]/50 shadow-xl" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl text-center">
          <div className="mb-8 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <img src="/logo.png" alt="Bull Wave Logo" className="w-56 h-auto object-contain" />
          </div>
          
          <h1 className="text-5xl font-extrabold text-[#D4AF37] mb-6 tracking-tight drop-shadow-sm">
            Bull Wave Club
          </h1>
          
          <p className="text-lg text-red-100 mb-16 leading-relaxed px-8">
            Effortlessly manage users, wallets, and gaming profiles while gaining powerful analytics and insights.
          </p>

          <div className="grid grid-cols-3 gap-6 w-full text-left">
            <div className="bg-white/10 backdrop-blur-lg border border-[#D4AF37]/30 p-6 rounded-2xl shadow-xl transition-transform hover:-translate-y-1">
              <ShieldCheck className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-slate-900 font-semibold mb-2">Secure Access</h3>
              <p className="text-red-100 text-sm leading-relaxed">Enterprise-grade security with multi-factor authentication</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-[#D4AF37]/30 p-6 rounded-2xl shadow-xl transition-transform hover:-translate-y-1">
              <Zap className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-slate-900 font-semibold mb-2">Lightning Fast</h3>
              <p className="text-red-100 text-sm leading-relaxed">Optimized performance for seamless user experience</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-[#D4AF37]/30 p-6 rounded-2xl shadow-xl transition-transform hover:-translate-y-1">
              <Star className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-slate-900 font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-red-100 text-sm leading-relaxed">Real-time insights and comprehensive reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-2/5 flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <img src="/logo.png" alt="Bull Wave Logo" className="h-20 w-auto object-contain drop-shadow-md" />
            </div>
            
            <h2 className="text-3xl font-bold text-[#800000] mb-2">
              {requires2FA ? "Two-Factor Auth" : "Welcome Admin"}
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              {requires2FA ? "Enter the 6-digit code from your authenticator app" : "Sign in to access your Admin Dashboard"}
            </p>
            <div className="w-12 h-1 bg-[#D4AF37] mx-auto rounded-full mb-8" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              {!requires2FA ? (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                              placeholder="Enter your email"
                              className="pl-10 py-6 border-slate-200 text-slate-800 placeholder:text-slate-500 focus-visible:ring-[#800000] rounded-xl bg-white"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 py-6 border-slate-200 text-slate-800 placeholder:text-slate-500 focus-visible:ring-[#800000] rounded-xl bg-white"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-slate-500 hover:text-slate-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between mt-4 mb-6">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-[#800000] focus:ring-[#800000]"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="font-semibold text-[#800000] hover:text-[#600000]">
                        Forgot Password?
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="totp_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Authentication Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyRound className="h-5 w-5 text-slate-500" />
                          </div>
                          <Input
                            placeholder="6-digit code"
                            maxLength={6}
                            className="pl-10 py-6 tracking-widest text-center text-xl border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-[#800000] rounded-xl bg-white"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              )}

              {error && (
                <div className="text-sm font-medium text-red-500 text-center">{error}</div>
              )}
              
              <Button 
                type="submit" 
                className="w-full py-6 bg-[#800000] hover:bg-[#600000] text-[#D4AF37] rounded-xl text-md font-semibold transition-all group shadow-lg shadow-[#800000]/30" 
                disabled={form.formState.isSubmitting || (requires2FA && form.watch("totp_code")?.length !== 6)}
              >
                {form.formState.isSubmitting ? "Authenticating..." : requires2FA ? "Verify Code" : "Sign In"}
                {!form.formState.isSubmitting && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
              
              {requires2FA && (
                <button
                  type="button"
                  onClick={() => { setRequires2FA(false); setError(null); form.setValue("password", ""); }}
                  className="w-full text-center text-sm text-slate-500 hover:text-slate-700 mt-4"
                >
                  Back to login
                </button>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
