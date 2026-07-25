import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import CustomSelect from "../components/CustomSelect";
import { SkeletonLoader } from "../components/LoadingSpinner";
import CreateLeadModal from "../components/modals/CreateLeadModal";
import CreateAdminModal from "../components/modals/CreateAdminModal";
import AssignModal from "../components/modals/AssignModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import StatusUpdateModal from "../components/modals/StatusUpdateModal";
import AddNoteModal from "../components/modals/AddNoteModal";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Eye,
  UserCheck,
  Trash2,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Inbox,
  Clock,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [assignModalData, setAssignModalData] = useState({
    isOpen: false,
    lead: null,
  });
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    lead: null,
  });
  const [statusModalData, setStatusModalData] = useState({
    isOpen: false,
    lead: null,
  });
  const [noteModalData, setNoteModalData] = useState({
    isOpen: false,
    lead: null,
  });

  useEffect(() => {
    fetchLeads();
    if (isAdmin) fetchTeamMembers();
  }, [pagination.page, statusFilter, assignedFilter]);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get("/auth/users");
      setTeamMembers(res.data.data || []);
    } catch (err) {}
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { page: pagination.page, limit: pagination.limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await api.get("/leads", { params });
      setLeads(res.data.data.leads || []);
      setPagination(
        res.data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchLeads();
  };

  const stats = {
    total: pagination.total || 0,
    new: leads.filter((l) => l.status === "New").length,
    qualified: leads.filter((l) => l.status === "Qualified").length,
    won: leads.filter((l) => l.status === "Won").length,
  };

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "New", value: "New" },
    { label: "Contacted", value: "Contacted" },
    { label: "Qualified", value: "Qualified" },
    { label: "Proposal Sent", value: "Proposal Sent" },
    { label: "Won", value: "Won" },
    { label: "Lost", value: "Lost" },
  ];

  const assigneeOptions = [
    { label: "All Assignees", value: "" },
    ...teamMembers.map((m) => ({ label: m.name, value: m._id })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] bg-[#E7E4D8] text-[#161D18] p-4 sm:p-6 lg:p-8 space-y-8 relative overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#49755B]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-6 shadow-xl relative z-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#2A4B3A]">
              {isAdmin ? "Admin Management Workspace" : "Member Workspace"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#161D18] tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#575D58] font-medium">
              {isAdmin
                ? "Manage pipeline leads, team assignments, and system users"
                : "Manage your assigned leads, status updates, and call notes"}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateAdminOpen(true)}
                className="px-5 py-2.5 bg-[#FAF8F0] hover:bg-[#EAE7DC] border border-[#C5C2B4] text-[#161D18] font-bold text-xs rounded-full shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#2A4B3A]" />
                <span>Manage Roles</span>
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-6 py-2.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Lead</span>
              </button>
            </div>
          )}
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between text-[#575D58] mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider">
                Total Leads
              </span>
              <div className="p-2 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#161D18]">{stats.total}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between text-[#575D58] mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider">
                New
              </span>
              <div className="p-2 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#161D18]">{stats.new}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between text-[#575D58] mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider">
                Qualified
              </span>
              <div className="p-2 bg-[#49755B]/15 text-[#2A4B3A] rounded-full">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#161D18]">
              {stats.qualified}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between text-[#575D58] mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider">
                Won Deals
              </span>
              <div className="p-2 bg-[#2A4B3A] text-white rounded-full">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#161D18]">{stats.won}</p>
          </motion.div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-4 shadow-xl space-y-4 relative z-30">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lead name, email, or company..."
                className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-10 pr-4 py-2.5 text-[#161D18] placeholder-stone-500 text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Custom Dropdown for Status */}
              <div className="w-44">
                <CustomSelect
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  options={statusOptions}
                  placeholder="All Statuses"
                />
              </div>

              {/* Custom Dropdown for Assignees */}
              {isAdmin && (
                <div className="w-44">
                  <CustomSelect
                    value={assignedFilter}
                    onChange={(val) => {
                      setAssignedFilter(val);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    options={assigneeOptions}
                    placeholder="All Assignees"
                  />
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs rounded-full shadow-md shadow-[#2A4B3A]/20 transition-all hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Lead Table (Desktop) & Responsive Cards (Mobile) */}
        <div className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-6 shadow-xl overflow-hidden relative z-10">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <SkeletonLoader count={5} />
          ) : leads.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Inbox className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-lg font-black text-[#161D18]">
                No Leads Found
              </h3>
              <p className="text-xs text-[#575D58] max-w-sm mx-auto font-medium">
                No leads match your current search terms or active filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-[11px] font-black uppercase text-[#575D58] tracking-wider">
                      <th className="py-3 px-4 rounded-l-xl">Lead Name</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="group transition-all"
                      >
                        <td className="py-3.5 px-4 font-bold text-[#161D18] group-hover:text-[#2A4B3A] bg-transparent group-hover:bg-[#FAF8F0] rounded-l-2xl transition-colors">
                          {lead.name}
                          <div className="text-xs text-[#575D58] font-normal">
                            {lead.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#4B5563] font-medium bg-transparent group-hover:bg-[#FAF8F0] transition-colors">
                          {lead.company || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 bg-transparent group-hover:bg-[#FAF8F0] transition-colors">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-[#4B5563] bg-transparent group-hover:bg-[#FAF8F0] transition-colors">
                          {lead.assignedTo ? (
                            lead.assignedTo.name
                          ) : (
                            <span className="text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#575D58] font-medium bg-transparent group-hover:bg-[#FAF8F0] transition-colors">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right bg-transparent group-hover:bg-[#FAF8F0] rounded-r-2xl transition-colors">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/leads/${lead._id}`}
                              title="View Details"
                              className="p-2 text-stone-500 hover:text-[#2A4B3A] hover:bg-[#2A4B3A]/10 rounded-full transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {isAdmin && (
                              <button
                                onClick={() =>
                                  setAssignModalData({ isOpen: true, lead })
                                }
                                title="Assign Lead"
                                className="p-2 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-all"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setStatusModalData({ isOpen: true, lead })
                              }
                              title="Update Status"
                              className="p-2 text-stone-500 hover:text-[#2A4B3A] hover:bg-[#2A4B3A]/10 rounded-full transition-all"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setNoteModalData({ isOpen: true, lead })
                              }
                              title="Add Note"
                              className="p-2 text-stone-500 hover:text-[#2A4B3A] hover:bg-[#2A4B3A]/10 rounded-full transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() =>
                                  setDeleteModalData({ isOpen: true, lead })
                                }
                                title="Delete Lead"
                                className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead._id}
                    className="p-4 bg-[#FAF8F0] rounded-3xl border border-[#C5C2B4] space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-black text-[#161D18] text-base">
                          {lead.name}
                        </div>
                        <div className="text-xs text-[#575D58]">
                          {lead.email}
                        </div>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>

                    <div className="text-xs text-[#4B5563] space-y-1">
                      <div>
                        <span className="font-bold text-[#161D18]">
                          Company:
                        </span>{" "}
                        {lead.company || "N/A"}
                      </div>
                      <div>
                        <span className="font-bold text-[#161D18]">
                          Assigned:
                        </span>{" "}
                        {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C5C2B4]/60">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="px-3 py-1.5 bg-[#F0EEE4] border border-[#C5C2B4] text-[#161D18] text-xs font-bold rounded-full"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() =>
                          setStatusModalData({ isOpen: true, lead })
                        }
                        className="px-3 py-1.5 bg-[#2A4B3A]/10 text-[#2A4B3A] text-xs font-bold rounded-full"
                      >
                        Status
                      </button>
                      <button
                        onClick={() => setNoteModalData({ isOpen: true, lead })}
                        className="px-3 py-1.5 bg-[#2A4B3A]/10 text-[#2A4B3A] text-xs font-bold rounded-full"
                      >
                        Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Pagination
            pagination={pagination}
            onPageChange={(p) =>
              setPagination((prev) => ({ ...prev, page: p }))
            }
          />
        </div>
      </div>

      <CreateLeadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchLeads}
      />
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        onCreated={fetchTeamMembers}
      />
      <AssignModal
        isOpen={assignModalData.isOpen}
        lead={assignModalData.lead}
        onClose={() => setAssignModalData({ isOpen: false, lead: null })}
        onAssigned={fetchLeads}
      />
      <StatusUpdateModal
        isOpen={statusModalData.isOpen}
        lead={statusModalData.lead}
        onClose={() => setStatusModalData({ isOpen: false, lead: null })}
        onUpdated={fetchLeads}
      />
      <AddNoteModal
        isOpen={noteModalData.isOpen}
        lead={noteModalData.lead}
        onClose={() => setNoteModalData({ isOpen: false, lead: null })}
        onNoteAdded={fetchLeads}
      />
      <ConfirmDeleteModal
        isOpen={deleteModalData.isOpen}
        lead={deleteModalData.lead}
        onClose={() => setDeleteModalData({ isOpen: false, lead: null })}
        onDeleted={fetchLeads}
      />
    </motion.div>
  );
};

export default DashboardPage;
