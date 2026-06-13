"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, Trophy } from "lucide-react";

export default function ResultHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const history = [
    {
      "Game ID": "GM-09921",
      "Game Name": "Ludo Master",
      "Total Pool": "₹1,000",
      "Winner": "Rajesh Kumar",
      "Winning Amount": "₹900",
      "Commission": "₹100",
      "Date": "2 Hrs ago"
    },
    {
      "Game ID": "GM-09920",
      "Game Name": "Crash Aviator",
      "Total Pool": "₹5,000",
      "Winner": "System (House Win)",
      "Winning Amount": "₹5,000",
      "Commission": "₹0",
      "Date": "5 Hrs ago"
    },
    {
      "Game ID": "GM-09919",
      "Game Name": "Teen Patti Plus",
      "Total Pool": "₹15,000",
      "Winner": "Priya Sharma",
      "Winning Amount": "₹13,500",
      "Commission": "₹1,500",
      "Date": "1 Day ago"
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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Result History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Archive of all declared games, winners, and platform commissions.</p>
        </div>
        <div className="flex items-center gap-3">
          
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Game ID or Winner..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500 dark:text-slate-400"
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
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">Game ID</th>
                  <th className="px-6 py-4 font-semibold">Game Name</th>
                  <th className="px-6 py-4 font-semibold">Total Pool</th>
                  <th className="px-6 py-4 font-semibold">Winner</th>
                  <th className="px-6 py-4 font-semibold text-right">Winning Amount</th>
                  <th className="px-6 py-4 font-semibold text-right text-emerald-600">Commission Earned</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((row, i) => (
                  <tr key={i} className="hover:bg-white/80 dark:bg-[#111111]/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">{row["Game ID"]}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{row["Game Name"]}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row["Total Pool"]}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-slate-800">{row["Winner"]}</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-bold text-right">{row["Winning Amount"]}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold text-right">{row["Commission"]}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row["Date"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111]">
            <span className="text-sm text-slate-500 dark:text-slate-400">Showing 1 to 3 of 3 entries</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
