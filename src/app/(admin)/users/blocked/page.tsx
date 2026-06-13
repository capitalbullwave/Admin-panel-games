"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, ShieldAlert, Loader2, CheckCircle } from "lucide-react";
import { api } from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BlockedUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, userId: number | null}>({isOpen: false, userId: null});

  const fetchBlockedUsers = async () => {
    try {
      const response = await api.get("/users/?status=Blocked");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch blocked users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = (userId: number) => {
    setConfirmModal({ isOpen: true, userId });
  };

  const executeUnblock = async () => {
    if (!confirmModal.userId) return;
    try {
      await api.patch(`/users/${confirmModal.userId}/status`, { status: "Active" });
      setConfirmModal({ isOpen: false, userId: null });
      fetchBlockedUsers();
    } catch (error) {
      console.error("Failed to unblock user", error);
      alert("Failed to unblock user");
    }
  };

  const filteredData = users.filter((row: any) => {

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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Blocked Users</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review users who have been blocked from the platform.</p>
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
              placeholder="Search blocked users..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-slate-500 dark:text-slate-400"
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
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Mobile</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((row, i) => (
                    <tr key={i} className="hover:bg-red-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-red-600 transition-colors capitalize">{row.name}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.mobile}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20 flex items-center w-max gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleUnblock(row.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-md bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors mr-2">
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No blocked users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal({...confirmModal, isOpen: open})}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5 p-0 overflow-hidden">
          <DialogTitle className="sr-only">Unblock User</DialogTitle>
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Unblock User
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Are you sure you want to unblock this user? They will regain access to their account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 flex gap-3 justify-end">
            <button type="button" onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="px-4 py-2 rounded-lg bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="button" onClick={executeUnblock} className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25">
              Yes, Unblock User
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
