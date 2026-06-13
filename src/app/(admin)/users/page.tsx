"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Plus, Filter, MoreVertical, Ban, CheckCircle, Eye, Trash2 } from "lucide-react";
import { api } from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, userId: number | null, status: string | null}>({isOpen: false, userId: null, status: null});
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, userId: number | null}>({isOpen: false, userId: null});
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "", referral_code: "", status: "Active" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/");
      const mappedUsers = response.data.map((u: any) => ({
        ...u,
        name: u.name || u.username || u.profile?.full_name,
        status: u.status || (u.wallet?.is_frozen ? "Blocked" : "Active"),
        wallet: {
          ...u.wallet,
          deposit_balance: u.wallet?.deposit_balance ?? u.wallet?.main_balance ?? 0
        }
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = (userId: number, status: string) => {
    setConfirmModal({ isOpen: true, userId, status });
  };

  const executeStatusUpdate = async () => {
    if (!confirmModal.userId || !confirmModal.status) return;
    try {
      await api.patch(`/users/${confirmModal.userId}/status`, { status: confirmModal.status });
      setConfirmModal({ isOpen: false, userId: null, status: null });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = (userId: number) => {
    setDeleteModal({ isOpen: true, userId });
  };

  const executeDeleteUser = async () => {
    if (!deleteModal.userId) return;
    try {
      await api.delete(`/users/${deleteModal.userId}`);
      setDeleteModal({ isOpen: false, userId: null });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.email) {
        delete (payload as any).email;
      }
      if (!payload.referral_code) {
        delete (payload as any).referral_code;
      }
      await api.post("/users/", payload);
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", mobile: "", password: "", referral_code: "", status: "Active" });
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to add user", error);
      alert(error.response?.data?.detail || "Failed to add user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.mobile || "").includes(searchQuery);
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform users, view their balances and status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] text-sm font-medium transition-all">
              <Plus className="h-4 w-4" />
              Add New
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
                  <input required type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder="Enter 10-digit mobile number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder="Enter password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Referral Code (Optional)</label>
                  <input type="text" value={formData.referral_code} onChange={e => setFormData({...formData, referral_code: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50" placeholder="Enter referral code" />
                </div>
                <DialogFooter className="mt-6 border-none bg-transparent p-0">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm font-medium transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 dark:text-white text-sm font-medium transition-all">Add User</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500 dark:text-slate-400"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-[#111111]/80 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-medium transition-colors">
              <Filter className="h-4 w-4" />
              {statusFilter === "All" ? "Filter" : statusFilter}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5">
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("All")}>All Users</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Active")}>Active Only</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setStatusFilter("Blocked")}>Blocked Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Mobile</th>
                    <th className="px-6 py-4 font-semibold">Balance</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredUsers.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors capitalize">{row.name}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{row.mobile}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{(row.wallet?.deposit_balance + row.wallet?.winning_balance + row.wallet?.bonus_balance) || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === "Active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setViewUser(row)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {row.status === "Active" ? (
                            <button 
                              onClick={() => handleUpdateStatus(row.id, "Blocked")}
                              className="p-1.5 rounded-md text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                              title="Block User"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(row.id, "Active")}
                              className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                              title="Unblock User"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteUser(row.id)}
                            className="p-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No users found
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
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${confirmModal.status === "Blocked" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {confirmModal.status === "Blocked" ? (
                  <Ban className="h-8 w-8" />
                ) : (
                  <CheckCircle className="h-8 w-8" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {confirmModal.status === "Blocked" ? "Block User" : "Unblock User"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Are you sure you want to {confirmModal.status === "Blocked" ? "block" : "unblock"} this user? 
                  {confirmModal.status === "Blocked" ? " They will not be able to access their account." : " They will regain access to their account."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 flex gap-3 justify-end">
            <button type="button" onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="px-4 py-2 rounded-lg bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="button" onClick={executeStatusUpdate} className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-lg ${confirmModal.status === "Blocked" ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/25" : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25"}`}>
              Yes, {confirmModal.status === "Blocked" ? "Block" : "Unblock"} User
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">User Details</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Name</p>
                <p className="font-semibold text-slate-900 dark:text-white capitalize text-base">{viewUser.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Email</p>
                <p className="font-semibold text-slate-900 dark:text-white text-base">{viewUser.email || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Mobile</p>
                <p className="font-semibold text-slate-900 dark:text-white text-base">{viewUser.mobile}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Password</p>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                  <span className="tracking-widest mt-1">••••••••</span> 
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Encrypted</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Referral Code</p>
                <p className="font-semibold text-slate-900 dark:text-white text-base">{viewUser.referral_code || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${viewUser.status === "Active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
                  {viewUser.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium">Joined Date</p>
                <p className="font-semibold text-slate-900 dark:text-white text-base">{new Date(viewUser.created_at).toLocaleString()}</p>
              </div>
              <div className="col-span-1 sm:col-span-2 mt-2 pt-6 border-t border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-base">Wallet Balances</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Deposit</p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">₹{viewUser.wallet?.deposit_balance || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Winning</p>
                    <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">₹{viewUser.wallet?.winning_balance || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Bonus</p>
                    <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">₹{viewUser.wallet?.bonus_balance || 0}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm">
                    <p className="text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wider font-medium mb-1">Total</p>
                    <p className="font-bold text-lg text-amber-600 dark:text-amber-400">₹{viewUser.wallet?.total_balance || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({...deleteModal, isOpen: open})}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#111111] border-slate-200 dark:border-white/5 p-0 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                <Trash2 className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete User
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Are you sure you want to permanently delete this user? This action cannot be undone and will erase all their data, including wallet balances.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 flex gap-3 justify-end">
            <button type="button" onClick={() => setDeleteModal({...deleteModal, isOpen: false})} className="px-4 py-2 rounded-lg bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="button" onClick={executeDeleteUser} className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-600/25">
              Yes, Delete User
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
