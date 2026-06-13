"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Filter, MoreVertical } from "lucide-react";

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const data = [
    {
        "Admin": "Super Admin",
        "Email": "admin@bullwave.com",
        "Role": "Super Admin",
        "Last Login": "Just now",
        "Status": "Active"
    },
    {
        "Admin": "Finance Manager",
        "Email": "finance@bullwave.com",
        "Role": "Finance",
        "Last Login": "2 Hours ago",
        "Status": "Active"
    },
    {
        "Admin": "Support Lead",
        "Email": "support@bullwave.com",
        "Role": "Support",
        "Last Login": "1 Day ago",
        "Status": "Active"
    }
];

  const filteredData = (typeof data !== 'undefined' ? data : []).filter((row: any) => {

    const searchStr = Object.values(row).join(" ").toLowerCase();

    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());

    let matchesStatus = true;

    if (statusFilter !== "All" && row["Status"]) {

        if (statusFilter === "Active") matchesStatus = ["Active", "Approved", "Completed", "Success"].includes(row["Status"]);

        else if (statusFilter === "Pending") matchesStatus = ["Pending", "In Progress", "Processing"].includes(row["Status"]);

        else if (statusFilter === "Blocked") matchesStatus = ["Blocked", "Rejected", "Failed", "Maintenance"].includes(row["Status"]);

    }

    return matchesSearch && matchesStatus;

  });



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Roles & Permissions</h2>
          <p className="text-sm text-slate-400 mt-1">Manage admin roles and access control.</p>
        </div>
        <div className="flex items-center gap-3">
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all">
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.02] flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-[#111111]/80 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-medium transition-colors">
              <Filter className="h-4 w-4" />
              {statusFilter === "All" ? "Filter" : statusFilter}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5">
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Active")}>Active / Success</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Pending")}>Pending / Processing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Blocked")}>Blocked / Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">Admin</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Last Login</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white group-hover:text-amber-400 transition-colors">{row["Admin"]}</td>\n                    <td className="px-6 py-4 text-slate-300">{row["Email"]}</td>\n                    <td className="px-6 py-4 text-slate-300">{row["Role"]}</td>\n                    <td className="px-6 py-4 text-slate-300">{row["Last Login"]}</td>\n                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row["Status"] === "Active" || row["Status"] === "Completed" || row["Status"] === "Approved" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : row["Status"] === "Pending" || row["Status"] === "In Progress" || row["Status"] === "Maintenance" || row["Status"] === "Open" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>{row["Status"]}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10">
            <span className="text-sm text-slate-400">Showing 1 to 3 of 3 entries</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 text-sm">Prev</button>
              <button className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm">1</button>
              <button className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-sm">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
