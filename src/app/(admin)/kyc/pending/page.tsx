"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, Clock, Eye, Check, X, Loader2, Plus, Upload } from "lucide-react";
import { api } from "@/lib/api";

export default function PendingKycPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentKycId, setCurrentKycId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [bankFilter, setBankFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  
  const [addForm, setAddForm] = useState({
    user_id: "",
    pan_number: "",
    pan_holder_name: "",
    bank_account_name: "",
    bank_account_number: "",
    ifsc_code: "",
    status: "pending"
  });
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/kyc/pending");
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch pending KYC", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/admin/kyc/approve/${id}`);
      fetchKyc();
    } catch (error) {
      console.error("Approve failed", error);
    }
  };

  const openRejectModal = (id: number) => {
    setCurrentKycId(id);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!currentKycId) return;
    try {
      await api.put(`/admin/kyc/reject/${currentKycId}`, {
        status: "rejected",
        rejection_reason: rejectReason || "Documents are invalid or unclear."
      });
      setShowRejectModal(false);
      setRejectReason("");
      setCurrentKycId(null);
      fetchKyc();
    } catch (error) {
      console.error("Reject failed", error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.user_id || !addForm.pan_number || !panFile) {
      alert("User ID, PAN Number, and PAN Image are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      
      let pan_image_url = "";
      let bank_document_url = "";
      
      // Upload PAN
      if (panFile) {
        const formData = new FormData();
        formData.append("file", panFile);
        const res = await api.post("/uploads/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        pan_image_url = res.data.url;
      }
      
      // Upload Bank
      if (bankFile) {
        const formData = new FormData();
        formData.append("file", bankFile);
        const res = await api.post("/uploads/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        bank_document_url = res.data.url;
      }
      
      // Submit KYC
      await api.post("/admin/kyc/add", {
        user_id: parseInt(addForm.user_id),
        pan_number: addForm.pan_number,
        pan_holder_name: addForm.pan_holder_name,
        pan_image_url: pan_image_url,
        bank_account_name: addForm.bank_account_name,
        bank_account_number: addForm.bank_account_number,
        ifsc_code: addForm.ifsc_code,
        bank_document_url: bank_document_url,
        status: addForm.status
      });
      
      setShowAddModal(false);
      setAddForm({ user_id: "", pan_number: "", pan_holder_name: "", bank_account_name: "", bank_account_number: "", ifsc_code: "", status: "pending" });
      setPanFile(null);
      setBankFile(null);
      fetchKyc();
    } catch (error: any) {
      console.error("Add failed", error);
      alert(error.response?.data?.detail || "Failed to add KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter(row => {
    const term = search.toLowerCase();
    const name = (row.pan_holder_name || "").toLowerCase();
    const pan = (row.pan_number || "").toLowerCase();
    const userId = (row.user_id || "").toString().toLowerCase();
    const kycId = (row.id || "").toString().toLowerCase();
    
    const matchesSearch = name.includes(term) || pan.includes(term) || userId.includes(term) || kycId.includes(term);
    if (!matchesSearch) return false;
    
    if (bankFilter === 'provided' && !row.bank_account_number) return false;
    if (bankFilter === 'missing' && row.bank_account_number) return false;
    
    if (timeFilter !== 'all') {
      const submittedAt = new Date(row.submitted_at);
      const now = new Date();
      if (timeFilter === 'today') {
        if (submittedAt.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (submittedAt < weekAgo) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Pending KYC</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review user identity documents awaiting approval.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add KYC Details
          </button>

        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name, PAN, or User ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500 dark:text-slate-400"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-[#111111]/80 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-medium transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filter
              {(bankFilter !== 'all' || timeFilter !== 'all') && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </button>
            
            {showFilterModal && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] p-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Filter Options</h3>
                  <button onClick={() => setShowFilterModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Bank Information</label>
                    <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 text-sm">
                      <option value="all">All</option>
                      <option value="provided">Provided</option>
                      <option value="missing">Missing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Submitted Time</label>
                    <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 text-sm">
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t dark:border-slate-800 flex justify-between gap-2">
                  <button 
                    onClick={() => { setBankFilter('all'); setTimeFilter('all'); }}
                    className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
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
                  <th className="px-6 py-4 font-semibold">Submitted At</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 relative">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading KYC Requests...
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      No pending KYC requests found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-amber-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                        KYC-{row.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
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
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {new Date(row.submitted_at).toLocaleString()}
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
                          <button 
                            onClick={() => handleApprove(row.id)}
                            className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors" 
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openRejectModal(row.id)}
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors" 
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                KYC Details - KYC-{selectedKyc.id}
              </h3>
              <button 
                onClick={() => setSelectedKyc(null)}
                className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
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

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
              <button 
                onClick={() => {
                   handleApprove(selectedKyc.id);
                   setSelectedKyc(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Approve
              </button>
              <button 
                onClick={() => {
                   openRejectModal(selectedKyc.id);
                   setSelectedKyc(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Reject KYC
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejecting this KYC document. This will be visible to the user.
            </p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Image is too blurry, Name mismatch..."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[100px] mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Add KYC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Add KYC Details
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">User ID *</label>
                  <input type="number" required value={addForm.user_id} onChange={e => setAddForm({...addForm, user_id: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Enter User ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select value={addForm.status} onChange={e => setAddForm({...addForm, status: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white">PAN Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">PAN Holder Name</label>
                    <input type="text" value={addForm.pan_holder_name} onChange={e => setAddForm({...addForm, pan_holder_name: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Name on PAN" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">PAN Number *</label>
                    <input type="text" required value={addForm.pan_number} onChange={e => setAddForm({...addForm, pan_number: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="ABCDE1234F" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">PAN Image *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                        <Upload className="w-4 h-4" /> {panFile ? 'Change Image' : 'Upload Image'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setPanFile(e.target.files?.[0] || null)} />
                      </label>
                      <span className="text-sm text-slate-500 truncate">{panFile ? panFile.name : 'No file chosen'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white">Bank Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Name</label>
                    <input type="text" value={addForm.bank_account_name} onChange={e => setAddForm({...addForm, bank_account_name: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Name on Account" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Number</label>
                    <input type="text" value={addForm.bank_account_number} onChange={e => setAddForm({...addForm, bank_account_number: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Account Number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">IFSC Code</label>
                    <input type="text" value={addForm.ifsc_code} onChange={e => setAddForm({...addForm, ifsc_code: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="IFSC Code" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bank Document Image</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                        <Upload className="w-4 h-4" /> {bankFile ? 'Change Image' : 'Upload Image'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setBankFile(e.target.files?.[0] || null)} />
                      </label>
                      <span className="text-sm text-slate-500 truncate">{bankFile ? bankFile.name : 'No file chosen'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Details
                </button>
              </div>
            </form>
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
