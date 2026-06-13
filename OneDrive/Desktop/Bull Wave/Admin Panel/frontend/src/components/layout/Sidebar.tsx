"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wallet, 
  CreditCard, 
  Gamepad2, 
  Trophy, 
  Headset, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/users", icon: Users },
  { name: "KYC Management", href: "/kyc", icon: FileText },
  { name: "Wallet Management", href: "/wallet", icon: Wallet },
  { name: "Payment Management", href: "/payments", icon: CreditCard },
  { name: "Game Management", href: "/games", icon: Gamepad2 },
  { name: "Result Management", href: "/results", icon: Trophy },
  { name: "Customer Support", href: "/support", icon: Headset },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Role & Permissions", href: "/roles", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 text-white border-r border-slate-800">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
          BULL WAVE
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}
