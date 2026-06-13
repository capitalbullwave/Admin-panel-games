"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  LogOut,
  Gamepad2,
  FileCheck2,
  CreditCard,
  Trophy,
  HeadphonesIcon,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  User,
  Sun,
  Moon,
  Bell
} from "lucide-react";
import { api } from "@/lib/axios";
import { Toaster } from "sonner";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { 
    name: "User Management", 
    icon: Users,
    subLinks: [
      { name: "User List", href: "/users" },
      { name: "KYC Pending Users", href: "/users/kyc-pending" },
      { name: "Blocked Users", href: "/users/blocked" },
    ]
  },
  { 
    name: "KYC Management", 
    icon: FileCheck2,
    subLinks: [
      { name: "Pending KYC", href: "/kyc/pending" },
      { name: "Approved KYC", href: "/kyc/approved" },
      { name: "Rejected KYC", href: "/kyc/rejected" },
    ]
  },
  { 
    name: "Wallet Management", 
    icon: Wallet,
    subLinks: [
      { name: "Deposits", href: "/wallet/deposits" },
      { name: "Withdrawals", href: "/wallet/withdrawals" },
      { name: "Transaction History", href: "/wallet/transactions" },
      { name: "Manual Credit/Debit", href: "/wallet/manual" },
    ]
  },
  { 
    name: "Payment Management", 
    icon: CreditCard,
    subLinks: [
      { name: "Payment Gateways", href: "/payments/gateways" },
      { name: "Failed Transactions", href: "/payments/failed" },
      { name: "Webhook Logs", href: "/payments/webhooks" },
    ]
  },
  { 
    name: "Game Management", 
    icon: Gamepad2,
    subLinks: [
      { name: "Game List", href: "/games/list" },
      { name: "Game Categories", href: "/games/categories" },
      { name: "Game Settings", href: "/games/settings" },
    ]
  },
  { 
    name: "Result Management", 
    icon: Trophy,
    subLinks: [
      { name: "Pending Results", href: "/results/pending" },
      { name: "Result History", href: "/results/history" },
      { name: "Settlement Processing", href: "/results/settlement" },
    ]
  },
  { name: "Customer Support", href: "/support", icon: HeadphonesIcon },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Roles & Permissions", href: "/roles", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "User Management": pathname.startsWith("/users"),
    "KYC Management": pathname.startsWith("/kyc"),
    "Wallet Management": pathname.startsWith("/wallet"),
    "Payment Management": pathname.startsWith("/payments"),
    "Game Management": pathname.startsWith("/games"),
    "Result Management": pathname.startsWith("/results")
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      } else {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      api.get("/auth/me").then((res) => {
        setUser(res.data);
      }).catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Find current page name for header
  let currentPageName = "Dashboard";
  sidebarLinks.forEach(link => {
    if (link.href === pathname) currentPageName = link.name;
    if (link.subLinks) {
      const sub = link.subLinks.find(s => s.href === pathname);
      if (sub) currentPageName = sub.name;
    }
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 transition-colors duration-300">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-72 border-r border-red-950 dark:border-white/5 bg-red-900 dark:bg-[#111111] flex flex-col shadow-2xl h-full transition-colors duration-300">
        <div className="py-3 px-6 flex flex-col items-center border-b border-red-950/50 dark:border-white/5 mb-1 bg-white/5 dark:bg-transparent">
          <img src="/logo.png" alt="Bull Wave Logo" className="h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
          <p className="text-sm text-amber-400/80 font-bold mt-1 tracking-widest uppercase text-center">Bull Wave Capital</p>
        </div>
        
        <nav className="flex-1 space-y-1.5 px-4 py-4 overflow-y-auto custom-scrollbar">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            
            if (link.subLinks) {
              const isExpanded = expandedMenus[link.name];
              const isAnySubActive = link.subLinks.some(sub => pathname === sub.href);
              
              return (
                <div key={link.name} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(link.name)}
                    className={`w-full group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      isAnySubActive && !isExpanded
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "text-red-100 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white dark:hover:text-slate-100 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`h-5 w-5 transition-transform duration-300 ${isAnySubActive ? "scale-110" : "group-hover:scale-110"}`} />
                      {link.name}
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="pl-12 pr-2 space-y-1 mt-1">
                      {link.subLinks.map((subLink) => {
                        const isSubActive = pathname === subLink.href;
                        return (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                              isSubActive
                                ? "text-amber-400 bg-white/5"
                                : "text-red-200 dark:text-slate-400 hover:text-white dark:hover:text-slate-100 hover:bg-white/5"
                            }`}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full ${isSubActive ? "bg-amber-400" : "bg-red-400/50"}`} />
                            {subLink.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href!}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                    : "text-red-100 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white dark:hover:text-slate-100 border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[76px] border-b border-red-950 dark:border-white/5 bg-red-900 dark:bg-[#111111] shadow-sm flex items-center justify-between px-8 transition-colors duration-300">
          <h1 className="text-xl font-bold text-white tracking-wide">
            {currentPageName}
          </h1>
          
          <div className="flex items-center gap-2 md:gap-4 relative">
            {/* Notification Icon */}
            <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-red-900 shadow-sm"></span>
            </button>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="h-6 w-px bg-white/20 mx-1 hidden md:block"></div>

            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-white/10 p-1.5 pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-white/10 shadow-sm"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-[2px]">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                  <User className="text-amber-400 h-4 w-4" />
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-white leading-tight capitalize">{user?.username || user?.email?.split('@')[0] || "Admin"}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-white/70 ml-1 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)} 
                />
                <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] border border-slate-100 dark:border-white/5 overflow-hidden z-50 transform origin-top-right transition-all">
                  <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-base capitalize">{user?.username || user?.email?.split('@')[0] || "Admin"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || "Loading..."}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#800000] dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/10 rounded-xl transition-all">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#800000] dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/10 rounded-xl transition-all">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
