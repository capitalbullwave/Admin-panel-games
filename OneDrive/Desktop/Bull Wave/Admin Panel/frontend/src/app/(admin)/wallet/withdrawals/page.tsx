"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, MoreVertical, ArrowUpFromLine, CheckCircle2, XCircle } from "lucide-react";

export default function WithdrawalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const data = [
    {
        "Txn ID": "WDL-441920",
        "User": "Karan Malhotra",
        "Amount": "₹15,000",
        "Method": "Bank Transfer",
        "Account": "XXXX-4321",
        "Status": "Pending",
        "Date": "30 Mins ago"
    },
    {
        "Txn ID": "WDL-441921",
        "User": "Vikram Patel",
        "Amount": "₹2,000",
        "Method": "UPI",
        "Account": "vikram@upi",
        "Status": "Completed",
        "Date": "4 Hrs ago"
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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Withdrawals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and process user withdrawal requests.</p>
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
              placeholder="Search withdrawals..." 
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
                  <th className="px-6 py-4 font-semibold">Txn ID</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Account details</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/80 dark:bg-[#111111]/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">{row["Txn ID"]}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row["User"]}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{row["Amount"]}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row["Method"]}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row["Account"]}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max gap-1 ${
                        row["Status"] === "Completed" 
                          ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/20" 
                          : row["Status"] === "Pending"
                          ? "bg-amber-500/20 text-amber-600 border border-amber-500/20"
                          : "bg-red-500/20 text-red-600 border border-red-500/20"
                      }`}>
                        {row["Status"] === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                        {row["Status"] === "Pending" && <ArrowUpFromLine className="w-3 h-3" />}
                        {row["Status"] === "Failed" && <XCircle className="w-3 h-3" />}
                        {row["Status"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row["Date"]}</td>
                    <td className="px-6 py-4 text-right">
                      {row["Status"] === "Pending" && (
                        <>
                          <button className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors mr-2">
                            Approve
                          </button>
                          <button className="px-3 py-1 text-xs font-semibold rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors mr-2">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="p-1 rounded-md hover:bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
                        <MoreVertical className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111]">
            <span className="text-sm text-slate-500 dark:text-slate-400">Showing 1 to 2 of 2 entries</span>
            <div className="flex items-center gap-2">
               {/* Pagination can be added here */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
