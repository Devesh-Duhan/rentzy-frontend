"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  ExternalLink,
  RefreshCcw,
  Edit2,
  Trash2,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
  Shield,
  MoreVertical,
  Mail,
  ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/lib/axios";
import { UserEditModal, DeleteConfirmationModal } from "../_components/AdminComponents";
import { toast } from "react-hot-toast";

export default function UsersSection() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "buyer", status: "Active" });
  const [isUserEditMode, setIsUserEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ id: null, name: "", type: "User" });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/admin/users');
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch records from the vault.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAction = (user) => {
    setEditingUserId(user._id);
    setIsUserEditMode(true);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: "Active" });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async () => {
    if (!userForm.name || !userForm.email) {
      toast.error("Identity credentials cannot be empty.");
      return;
    }

    const loadingToast = toast.loading(isUserEditMode ? "Updating identity..." : "Dispatching invitation...");

    try {
      if (isUserEditMode) {
        await axiosInstance.put(`/admin/users/${editingUserId}`, userForm);
        toast.success("Identity updated successfully.", { id: loadingToast });
      } else {
        await axiosInstance.post('/admin/users/invite', userForm);
        toast.success("Invitation dispatched successfully.", { id: loadingToast });
      }
      fetchUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed in the matrix.";
      toast.error(msg, { id: loadingToast });
    }
  };

  const handleUserDelete = (user) => {
    setDeleteConfig({ id: user._id, name: user.name, type: "User" });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading("Erasing identity...");
    try {
      await axiosInstance.delete(`/admin/users/${deleteConfig.id}`);
      toast.success("Identity erased from existence.", { id: loadingToast });
      fetchUsers();
    } catch (error) {
      toast.error("Erasure failed. Identity protected.", { id: loadingToast });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: "Total Users", count: users.length, icon: UsersIcon, color: "indigo" },
    { label: "Elite Sellers", count: users.filter(u => u.role === 'seller').length, icon: Shield, color: "emerald" },
    { label: "Administrators", count: users.filter(u => u.role === 'admin').length, icon: UserCheck, color: "purple" },
    { label: "New Joiners", count: users.filter(u => new Date() - new Date(u.createdAt) < 7 * 24 * 60 * 60 * 1000).length, icon: UserPlus, color: "amber" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Identity Vault</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold mt-2">Manage all registered entities and their platform permissions.</p>
        </div>
        <button
          onClick={() => {
            setIsUserEditMode(false);
            setUserForm({ name: "", email: "", role: "buyer", status: "Active" });
            setIsUserModalOpen(true);
          }}
          className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-indigo-600 text-white rounded-[20px] md:rounded-[24px] font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-slate-900 transition-all"
        >
          <UserPlus size={18} /> Invite New Entity
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="p-5 md:p-8 bg-white dark:bg-slate-800/40 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-${s.color}-600`}>
              <s.icon size={120} className="w-20 h-20 md:w-30 md:h-30" />
            </div>
            <div className={`w-10 h-10 md:w-14 md:h-14 bg-${s.color}-50 dark:bg-${s.color}-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-${s.color}-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
              <s.icon size={28} className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">{s.count}</h4>
          </motion.div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-3xl">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-xl md:rounded-2xl text-[13px] md:text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:auto">
          <div className="relative group flex-1 md:flex-none">
            <Filter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-12 pr-10 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-black text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer w-full"
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Seller</option>
              <option>Buyer</option>
            </select>
          </div>
          <button onClick={fetchUsers} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all active:scale-90">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className=" dark:bg-white/2 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-6 text-left">Identity Profile</th>
                <th className="px-8 py-6 text-left">Internal Role</th>
                <th className="px-8 py-6 text-left">Access Status</th>
                <th className="px-8 py-6 text-left">Last Transmission</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Decrypting Identity Records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                          <Search size={40} />
                        </div>
                        <h5 className="text-xl font-black text-slate-700 dark:text-white">Empty Archive</h5>
                        <p className="text-slate-400 font-bold text-sm mt-2">We couldn't find any entity matching your filtered parameters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={user._id}
                      className="group hover:bg-slate-50/80 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-100 dark:shadow-none overflow-hidden border-2 border-white dark:border-slate-800 group-hover:scale-105 transition-transform">
                              {user.profileImage ? <Image src={user.profileImage} width={56} height={56} className="w-full h-full object-cover" unoptimized /> : user.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-none mb-1">{user.name}</div>
                            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-indigo-500 transition-colors">
                              <Mail size={12} />
                              <span className="text-xs font-bold">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 border border-purple-100 dark:border-purple-500/20' :
                          user.role === 'seller' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' :
                            'bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-100 dark:border-white/10'
                          }`}>
                          <Shield size={14} />
                          {user.role}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Authorized</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-white">
                            <Clock size={14} className="text-slate-400" />
                            {new Date(user.updatedAt || user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sync: Active</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.role === "seller" && (
                            <button onClick={() => toast.success(`Assuming control as ${user.name}...`)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90" title="Login Session">
                              <ExternalLink size={18} />
                            </button>
                          )}
                          <button onClick={() => toast.success("Reset sequence initiated...")} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90" title="Reset Access">
                            <RefreshCcw size={18} />
                          </button>
                          <button onClick={() => handleUserAction(user)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90" title="Modify Entity">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleUserDelete(user)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-90" title="Purge Record">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {/* More Menu for Mobile */}
                        <div className="md:hidden">
                          <button className="p-2 text-slate-400"><MoreVertical size={20} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6  dark:bg-white/2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span> of <span className="text-slate-900 dark:text-white">{users.length}</span> entities
          </p>
          <div className="flex gap-2">
            <button disabled className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-black text-slate-400 opacity-50">Prev Archive</button>
            <button disabled className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-black text-slate-400 opacity-50">Next Archive</button>
          </div>
        </div>
      </div>

      <UserEditModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        form={userForm}
        onFormChange={(e) => setUserForm({ ...userForm, [e.target.name]: e.target.value })}
        onSubmit={handleUserSubmit}
        isEditMode={isUserEditMode}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteConfig.name}
        type="User"
      />
    </div>
  );
}
