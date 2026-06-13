"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, Clock, Eye, XCircle, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function RejectedKycPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/kyc/rejected");
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch rejected KYC", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Rejected KYC</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Record of failed verifications and their rejection reasons.</p>
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
              placeholder="Search by Name, PAN, or User ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-slate-500 dark:text-slate-400"
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
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-semibold">KYC ID</th>
                  <th className="px-6 py-4 font-semibold">User / Name</th>
                  <th className="px-6 py-4 font-semibold">PAN Number</th>
                  <th className="px-6 py-4 font-semibold">Bank Info</th>
                  <th className="px-6 py-4 font-semibold">Rejection Reason</th>
                  <th className="px-6 py-4 font-semibold">Rejected By</th>
                  <th className="px-6 py-4 font-semibold">Rejected At</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 relative">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading Rejected KYC...
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      No rejected KYC requests found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-red-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                        KYC-{row.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        {row.pan_holder_name || `User ID: ${row.user_id}`}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {row.pan_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                        {row.bank_account_number ? (
                           <div className="text-xs">
                             <div>{row.bank_account_name}</div>
                             <div className="text-slate-500">{row.bank_account_number} ({row.ifsc_code})</div>
                           </div>
                        ) : 'Pending Bank'}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-semibold max-w-[200px] truncate" title={row.rejection_reason}>
                        {row.rejection_reason || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {row.reviewed_by ? `Admin ID: ${row.reviewed_by}` : 'Auto-Rejected'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          {row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedKyc(row)}
                            className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors" 
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#111111]">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredData.length} entries
            </span>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Rejected KYC Details - KYC-{selectedKyc.id}
              </h3>
              <button 
                onClick={() => setSelectedKyc(null)}
                className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {selectedKyc.rejection_reason && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">Reason for Rejection</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{selectedKyc.rejection_reason}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">PAN Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-medium dark:text-white">{selectedKyc.pan_holder_name || 'N/A'}</span>
                  <span className="text-slate-500">PAN Number:</span>
                  <span className="font-medium dark:text-white">{selectedKyc.pan_number || 'N/A'}</span>
                </div>
                {selectedKyc.pan_image_url && (
                  <div 
                    className="mt-4 border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage(selectedKyc.pan_image_url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedKyc.pan_image_url.startsWith('http') ? selectedKyc.pan_image_url : `http://localhost:8000${selectedKyc.pan_image_url}`} alt="PAN Document" className="w-full h-auto object-contain max-h-60" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">Bank Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">Account Name:</span>
                  <span className="font-medium dark:text-white">{selectedKyc.bank_account_name || 'N/A'}</span>
                  <span className="text-slate-500">Account No:</span>
                  <span className="font-medium dark:text-white">{selectedKyc.bank_account_number || 'N/A'}</span>
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-medium dark:text-white">{selectedKyc.ifsc_code || 'N/A'}</span>
                </div>
                {selectedKyc.bank_document_url && (
                  <div 
                    className="mt-4 border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage(selectedKyc.bank_document_url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedKyc.bank_document_url.startsWith('http') ? selectedKyc.bank_document_url : `http://localhost:8000${selectedKyc.bank_document_url}`} alt="Bank Document" className="w-full h-auto object-contain max-h-60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 animate-in fade-in zoom-in duration-300" 
          onClick={() => setPreviewImage(null)}
        >
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewImage.startsWith('http') ? previewImage : `http://localhost:8000${previewImage}`} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
