"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  if (!mounted) return null;

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-white capitalize">
              {pathname.split("/").filter(Boolean)[0]?.replace("-", " ") || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 ring-2 ring-slate-800"></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-900 p-6 text-slate-200">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
