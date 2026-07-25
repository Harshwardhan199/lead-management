import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import AssignModal from '../components/modals/AssignModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
  MessageSquare,
  Activity,
  UserCheck,
  Trash2,
  Send,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [leadRes, activityRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/activity`),
      ]);

      setLead(leadRes.data.data.lead);
      setNotes(leadRes.data.data.notes || []);
      setActivities(activityRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/leads/${id}`, { status: newStatus });
      await fetchLeadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setSubmittingNote(true);
      await api.post(`/leads/${id}/notes`, { note: noteText });
      setNoteText('');
      await fetchLeadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading lead file..." />;
  }

  if (error || !lead) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Access Denied or Not Found</h3>
          <p className="text-sm text-slate-400">{error || 'Lead file could not be retrieved.'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Leads
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsAssignOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition-all"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>Assign Lead</span>
                </button>

                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Lead Main Info Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-white">{lead.name}</h1>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-slate-400 text-sm">
                Created on {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Quick Status Updater */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">
                Change Status:
              </span>
              <select
                disabled={updatingStatus}
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Email</span>
                <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                  {lead.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Phone</span>
                <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors">
                  {lead.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Company</span>
                <span className="text-sm font-semibold text-white">{lead.company || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Assigned To</span>
                <span className="text-sm font-semibold text-white">
                  {lead.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {lead.message && (
            <div className="pt-4 border-t border-slate-800/80">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Lead Message / Inquiry
              </span>
              <p className="text-sm text-slate-300 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 leading-relaxed">
                {lead.message}
              </p>
            </div>
          )}
        </div>

        {/* Two-Column Section: Notes & Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Notes Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Lead Notes ({notes.length})</h3>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-6 space-y-3">
                <textarea
                  rows={3}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a new internal note or call update..."
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingNote || !noteText.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    No notes recorded yet. Add your first note above.
                  </p>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n._id}
                      className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-indigo-400">{n.user?.name}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {n.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity Audit History Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Activity Audit Log</h3>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No activity logged yet.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act._id} className="relative">
                      {/* Timeline Bullet Dot */}
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{act.action}</span>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(act.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          By <span className="text-slate-300 font-medium">{act.user?.name || 'System'}</span>
                        </p>
                        {act.metadata && (
                          <div className="mt-1.5 text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-2 font-mono">
                            {JSON.stringify(act.metadata)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignModal
        isOpen={isAssignOpen}
        lead={lead}
        onClose={() => setIsAssignOpen(false)}
        onAssigned={fetchLeadData}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        lead={lead}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default LeadDetailsPage;
