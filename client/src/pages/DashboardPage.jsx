import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateLeadModal from '../components/modals/CreateLeadModal';
import AssignModal from '../components/modals/AssignModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import StatusUpdateModal from '../components/modals/StatusUpdateModal';
import AddNoteModal from '../components/modals/AddNoteModal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  UserCheck,
  Trash2,
  RefreshCw,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Inbox,
  Clock,
  CheckCircle,
  UserX,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignModalData, setAssignModalData] = useState({ isOpen: false, lead: null });
  const [deleteModalData, setDeleteModalData] = useState({ isOpen: false, lead: null });
  const [statusModalData, setStatusModalData] = useState({ isOpen: false, lead: null });
  const [noteModalData, setNoteModalData] = useState({ isOpen: false, lead: null });

  useEffect(() => {
    fetchLeads();
    if (isAdmin) {
      fetchTeamMembers();
    }
  }, [pagination.page, statusFilter, assignedFilter]);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/auth/users');
      setTeamMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch team members');
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await api.get('/leads', { params });
      const { leads: leadList, pagination: pagData } = res.data.data;
      setLeads(leadList || []);
      setPagination(pagData || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLeads();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Metrics Calculation
  const stats = {
    total: pagination.total || 0,
    new: leads.filter((l) => l.status === 'New').length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    won: leads.filter((l) => l.status === 'Won').length,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{isAdmin ? 'Admin Portal' : 'Member Workspace'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              {isAdmin
                ? 'Manage enterprise pipeline, assign team members, and track real-time activity'
                : 'Manage your assigned leads, update progress, and record client notes'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Lead</span>
            </button>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Leads</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.total}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">New</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.new}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Qualified</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.qualified}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Won Deals</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.won}</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by lead name, email, or company..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">
                    All Statuses
                  </option>
                  <option value="New" className="bg-slate-900">
                    New
                  </option>
                  <option value="Contacted" className="bg-slate-900">
                    Contacted
                  </option>
                  <option value="Qualified" className="bg-slate-900">
                    Qualified
                  </option>
                  <option value="Proposal Sent" className="bg-slate-900">
                    Proposal Sent
                  </option>
                  <option value="Won" className="bg-slate-900">
                    Won
                  </option>
                  <option value="Lost" className="bg-slate-900">
                    Lost
                  </option>
                </select>
              </div>

              {/* Admin AssignedTo Filter */}
              {isAdmin && (
                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <select
                    value={assignedFilter}
                    onChange={(e) => {
                      setAssignedFilter(e.target.value);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900">
                      All Assignees
                    </option>
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m._id} className="bg-slate-900">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Lead Table Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner text="Fetching lead pipeline..." />
          ) : leads.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Leads Found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                No leads match your current search terms or filter criteria. Try adjusting filters or create a new lead.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-4 px-4">Lead Name</th>
                    <th className="py-4 px-4">Company</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Assigned To</th>
                    <th className="py-4 px-4">Created Date</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-xs text-slate-400">{lead.email}</div>
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        {lead.company || 'N/A'}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      <td className="py-4 px-4">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {lead.assignedTo.name?.charAt(0)}
                            </div>
                            <span className="text-slate-200 text-xs font-medium">
                              {lead.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                            <UserX className="w-3 h-3" /> Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/leads/${lead._id}`}
                            title="View Lead Details"
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {isAdmin && (
                            <button
                              onClick={() => setAssignModalData({ isOpen: true, lead })}
                              title="Assign Lead"
                              className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all border border-transparent hover:border-purple-500/20"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setStatusModalData({ isOpen: true, lead })}
                            title="Update Status"
                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all border border-transparent hover:border-amber-500/20"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setNoteModalData({ isOpen: true, lead })}
                            title="Add Note"
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-500/20"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setDeleteModalData({ isOpen: true, lead })}
                              title="Delete Lead"
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
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
          )}

          {/* Pagination */}
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* Modals */}
      <CreateLeadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchLeads}
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
    </div>
  );
};

export default DashboardPage;
