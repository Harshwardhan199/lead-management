import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import CustomSelect from '../components/CustomSelect';
import { SkeletonPage } from '../components/LoadingSpinner';
import AssignModal from '../components/modals/AssignModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User,
  MessageSquare,
  Activity,
  UserCheck,
  Trash2,
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
  const [noteText, setNoteText] = useState('');

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const [leadRes, actRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/leads/${id}/activity`),
      ]);
      setLead(leadRes.data.data.lead);
      setNotes(leadRes.data.data.notes || []);
      setActivities(actRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lead');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/leads/${id}`, { status });
      fetchLeadData();
    } catch (err) {}
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post(`/leads/${id}/notes`, { note: noteText });
      setNoteText('');
      fetchLeadData();
    } catch (err) {}
  };

  if (loading) return <SkeletonPage />;
  if (!lead) return <div className="p-8 text-center text-[#4B5563]">Lead file not found.</div>;

  const statusOptions = [
    { label: 'New', value: 'New' },
    { label: 'Contacted', value: 'Contacted' },
    { label: 'Qualified', value: 'Qualified' },
    { label: 'Proposal Sent', value: 'Proposal Sent' },
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] bg-[#E7E4D8] text-[#161D18] p-4 sm:p-6 lg:p-8 space-y-8 relative overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#49755B]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#575D58] hover:text-[#161D18] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#2A4B3A]" /> Back to All Leads
          </Link>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button onClick={() => setIsAssignOpen(true)} className="px-5 py-2.5 bg-[#FAF8F0] border border-[#C5C2B4] text-[#161D18] font-bold text-xs rounded-full shadow-xs hover:bg-[#EAE7DC] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2A4B3A]" /> Assign Lead
              </button>
              <button onClick={() => setIsDeleteOpen(true)} className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-full hover:bg-rose-100 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Lead Main Info Banner */}
        <div className="bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#C5C2B4]/60">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-[#161D18] tracking-tight">{lead.name}</h1>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs text-[#575D58] font-medium">Created on {new Date(lead.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-3 bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl p-2">
              <span className="text-[11px] font-black text-[#575D58] uppercase tracking-wider pl-2">Status:</span>
              <div className="w-40">
                <CustomSelect
                  value={lead.status}
                  onChange={handleStatusChange}
                  options={statusOptions}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-2xl border border-[#2A4B3A]/30"><Mail className="w-5 h-5" /></div>
              <div><span className="block text-[10px] font-black text-[#575D58] uppercase">Email</span><a href={`mailto:${lead.email}`} className="text-sm font-bold text-[#161D18] hover:text-[#2A4B3A]">{lead.email}</a></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-2xl border border-[#2A4B3A]/30"><Phone className="w-5 h-5" /></div>
              <div><span className="block text-[10px] font-black text-[#575D58] uppercase">Phone</span><a href={`tel:${lead.phone}`} className="text-sm font-bold text-[#161D18] hover:text-[#2A4B3A]">{lead.phone}</a></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-2xl border border-[#2A4B3A]/30"><Building2 className="w-5 h-5" /></div>
              <div><span className="block text-[10px] font-black text-[#575D58] uppercase">Company</span><span className="text-sm font-bold text-[#161D18]">{lead.company || 'N/A'}</span></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-2xl border border-[#2A4B3A]/30"><User className="w-5 h-5" /></div>
              <div><span className="block text-[10px] font-black text-[#575D58] uppercase">Assigned To</span><span className="text-sm font-bold text-[#161D18]">{lead.assignedTo?.name || 'Unassigned'}</span></div>
            </div>
          </div>

          {lead.message && (
            <div className="pt-4 border-t border-[#C5C2B4]/60">
              <span className="block text-[11px] font-black text-[#575D58] uppercase tracking-wider mb-2">Lead Message / Inquiry</span>
              <p className="text-sm text-[#4B5563] bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl p-4 leading-relaxed font-medium">{lead.message}</p>
            </div>
          )}
        </div>

        {/* Two-Column: Notes & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-[#161D18] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2A4B3A]" /> Internal Notes ({notes.length})
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea rows={3} required value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add meeting outcome or call update..." className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl p-4 text-[#161D18] text-sm focus:border-[#2A4B3A] outline-none" />
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs rounded-full shadow-md shadow-[#2A4B3A]/20">Post Note</button>
              </div>
            </form>
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n._id} className="bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl p-4 space-y-1">
                  <div className="flex justify-between text-xs text-[#575D58] font-bold"><span className="text-[#2A4B3A]">{n.user?.name}</span><span>{new Date(n.createdAt).toLocaleString()}</span></div>
                  <p className="text-sm text-[#161D18] font-medium">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-[#161D18] flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-800" /> Activity Audit History
            </h3>
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act._id} className="text-xs border-b border-[#C5C2B4]/60 pb-3 space-y-1">
                  <div className="font-bold text-[#161D18]">{act.action}</div>
                  <div className="text-[#575D58]">By <span className="font-bold text-[#161D18]">{act.user?.name || 'System'}</span> at {new Date(act.createdAt).toLocaleTimeString()}</div>
                  {act.metadata && <div className="text-[11px] font-mono bg-[#FAF8F0] border border-[#C5C2B4] rounded-xl p-2 text-[#4B5563]">{JSON.stringify(act.metadata)}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AssignModal isOpen={isAssignOpen} lead={lead} onClose={() => setIsAssignOpen(false)} onAssigned={fetchLeadData} />
      <ConfirmDeleteModal isOpen={isDeleteOpen} lead={lead} onClose={() => setIsDeleteOpen(false)} onDeleted={() => navigate('/dashboard')} />
    </motion.div>
  );
};

export default LeadDetailsPage;
