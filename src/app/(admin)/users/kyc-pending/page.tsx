"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/axios";

export default function KycPendingUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKycRequests = async () => {
    try {
      const response = await api.get("/admin/kyc/pending");
      setKycRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch pending KYC requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const handleApprove = async (kycId: number) => {
    if (!confirm("Are you sure you want to approve this KYC?")) return;
    try {
      await api.put(`/admin/kyc/approve/${kycId}`);
      fetchKycRequests();
    } catch (error) {
      console.error("Failed to approve KYC", error);
      alert("Failed to approve KYC");
    }
  };

  const handleReject = async (kycId: number) => {
    const reason = prompt("Please enter the reason for rejection:");
    if (reason === null) return; // User cancelled
    
    try {
      await api.put(`/admin/kyc/reject/${kycId}`, { 
        status: "rejected", 
        rejection_reason: reason || "Document verification failed" 
      });
      fetchKycRequests();
    } catch (error) {
      console.error("Failed to reject KYC", error);
      alert("Failed to reject KYC");
    }
  };

  const filteredData = kycRequests.filter((row: any) => {

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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">KYC Pending Users</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and approve pending KYC submissions.</p>
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
              placeholder="Search pending applications..." 
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
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User Details</th>
                    <th className="px-6 py-4 font-semibold">PAN Details</th>
                    <th className="px-6 py-4 font-semibold">Bank Details</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Submitted</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kycRequests.map((row, i) => (
                    <tr key={i} className="hover:bg-amber-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white capitalize">{row.user?.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{row.user?.mobile || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 dark:text-slate-300">{row.pan_number || "N/A"}</div>
                        {row.pan_image_url && <a href={row.pan_image_url.startsWith('http') ? row.pan_image_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${row.pan_image_url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View Document</a>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 dark:text-slate-300">{row.bank_account_number ? `A/C: ${row.bank_account_number}` : "N/A"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{row.ifsc_code ? `IFSC: ${row.ifsc_code}` : ""}</div>
                        {row.bank_document_url && <a href={row.bank_document_url.startsWith('http') ? row.bank_document_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${row.bank_document_url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View Document</a>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 border border-amber-500/20 flex items-center w-max gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{new Date(row.submitted_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleApprove(row.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors mr-2 flex inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(row.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors flex inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                  {kycRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No pending KYC requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
